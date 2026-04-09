'use client';

import React, { use, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { notifySupportError } from '@/lib/client-feedback';
import {
  type SupplierPortalRfq,
  type SupplierPortalQuotationPayload,
  type SupplierPortalUploadedAttachment,
} from '@/app/actions/rfqPortal';
import {
  useSupplierPortalRfq,
  useSubmitSupplierPortalQuotation,
  useUploadSupplierPortalAttachment,
} from '@/hooks/useSupplierRFQPortal';

type ErrorType = 'invalid' | 'expired' | 'closed' | 'unavailable';

type SubmissionResult = {
  quotationId: string;
  submittedAt: string;
  totalAmount: number;
  source: 'fresh' | 'existing';
};
type UploadState = 'idle' | 'uploading';

function getCurrencyMarker(currency: string) {
  if (currency === 'USD') return '$';
  return currency;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function buildInitialWorkflowState(rfq: SupplierPortalRfq) {
  const submittedQuotation = rfq.submittedQuotation;

  if (!submittedQuotation) {
    return {
      submissionState: 'idle' as const,
      prices: {} as Record<string, number>,
      leadTimes: {} as Record<string, string>,
      remarks: {} as Record<string, string>,
      currency: 'USD',
      validity: '',
      paymentTerms: '',
      incoterms: '',
      notes: '',
      uploadedFiles: [] as SupplierPortalUploadedAttachment[],
      submissionResult: null as SubmissionResult | null,
    };
  }

  const prices: Record<string, number> = {};
  const leadTimes: Record<string, string> = {};
  const remarks: Record<string, string> = {};

  for (const item of submittedQuotation.items) {
    prices[item.requisitionItemId] = Number(item.unitPrice);
    leadTimes[item.requisitionItemId] = item.leadTime;
    remarks[item.requisitionItemId] = item.remarks ?? '';
  }

  return {
    submissionState: 'success' as const,
    prices,
    leadTimes,
    remarks,
    currency: submittedQuotation.currency || 'USD',
    validity: submittedQuotation.validityDate || '',
    paymentTerms: submittedQuotation.paymentTerms || '',
    incoterms: submittedQuotation.incoterms || '',
    notes: submittedQuotation.notes || '',
    uploadedFiles: submittedQuotation.attachments ?? [],
    submissionResult: {
      quotationId: submittedQuotation.quotationId,
      submittedAt: submittedQuotation.submittedAt,
      totalAmount: submittedQuotation.totalAmount,
      source: 'existing' as const,
    },
  };
}

export default function SupplierRFQPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const portalQuery = useSupplierPortalRfq(token);

  if (portalQuery.isLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Retrieving Secure Document</h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Verifying access token and loading RFQ details...
        </p>
      </div>
    );
  }

  if (portalQuery.isError) {
    console.error(portalQuery.error);
    return <ErrorState type="unavailable" />;
  }

  if (!portalQuery.data) return null;
  if (portalQuery.data.status !== 'open') return <ErrorState type={portalQuery.data.status} />;

  return (
    <RFQWorkflow
      key={`${portalQuery.data.rfq.id}-${portalQuery.data.rfq.submittedQuotation?.quotationId ?? 'draft'}`}
      rfq={portalQuery.data.rfq}
      token={token}
      onReload={() => void portalQuery.refetch()}
    />
  );
}

function ErrorState({ type }: { type: ErrorType }) {
  const content: Record<ErrorType, { title: string; desc: string }> = {
    invalid: {
      title: 'Invalid RFQ Link',
      desc: 'The link provided does not exist or has been malformed. Please request a new invitation from the issuer.',
    },
    expired: {
      title: 'This RFQ has expired',
      desc: 'The submission deadline for this request has passed. Responses are no longer being accepted.',
    },
    closed: {
      title: 'RFQ Closed',
      desc: 'The issuing organization has stopped accepting responses for this sourcing event.',
    },
    unavailable: {
      title: 'Unable to load RFQ',
      desc: 'We could not reach the RFQ portal right now. Please refresh the page or try again shortly.',
    },
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
          <AlertCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{content[type].title}</h2>
        <p className="text-sm leading-relaxed text-gray-500">{content[type].desc}</p>
      </div>
    </div>
  );
}

function RFQWorkflow({
  rfq,
  token,
  onReload,
}: {
  rfq: SupplierPortalRfq;
  token: string;
  onReload: () => void;
}) {
  const submitQuotationMutation = useSubmitSupplierPortalQuotation(token);
  const uploadAttachmentMutation = useUploadSupplierPortalAttachment(token);
  const initialState = buildInitialWorkflowState(rfq);
  const [submissionState, setSubmissionState] =
    useState<'idle' | 'submitting' | 'success'>(initialState.submissionState);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [termsOpen, setTermsOpen] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>(initialState.prices);
  const [leadTimes, setLeadTimes] = useState<Record<string, string>>(initialState.leadTimes);
  const [remarks, setRemarks] = useState<Record<string, string>>(initialState.remarks);
  const [currency, setCurrency] = useState(initialState.currency);
  const [validity, setValidity] = useState(initialState.validity);
  const [paymentTerms, setPaymentTerms] = useState(initialState.paymentTerms);
  const [incoterms, setIncoterms] = useState(initialState.incoterms);
  const [notes, setNotes] = useState(initialState.notes);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] =
    useState<SupplierPortalUploadedAttachment[]>(initialState.uploadedFiles);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(initialState.submissionResult);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const subtotal = useMemo(() => {
    return rfq.items.reduce((accumulator, item) => {
      const price = prices[item.id];
      return accumulator + (Number.isFinite(price) ? price * item.quantity : 0);
    }, 0);
  }, [prices, rfq.items]);

  const isFormValid = useMemo(() => {
    if (!validity || !paymentTerms || !incoterms) {
      return false;
    }

    return rfq.items.every((item) => {
      const unitPrice = prices[item.id];
      const leadTime = leadTimes[item.id] ?? '';
      return Number.isFinite(unitPrice) && unitPrice >= 0 && leadTime.trim().length > 0;
    });
  }, [incoterms, leadTimes, paymentTerms, prices, rfq.items, validity]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removePendingFile = (targetIndex: number) => {
    setPendingFiles((current) => current.filter((_, index) => index !== targetIndex));
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) {
      return [];
    }

    setUploadState('uploading');

    const successfulUploads: SupplierPortalUploadedAttachment[] = [];
    const failedFiles: File[] = [];

    for (const file of filesToUpload) {
      try {
        const uploaded = await uploadAttachmentMutation.mutateAsync(file);
        successfulUploads.push(uploaded);
      } catch (error) {
        console.error(error);
        failedFiles.push(file);
        notifySupportError(error, { title: 'Failed to upload attachment' });
      }
    }

    if (successfulUploads.length > 0) {
      setUploadedFiles((current) => [...current, ...successfulUploads]);
      toast.success(
        successfulUploads.length === 1
          ? 'Attachment uploaded successfully'
          : `${successfulUploads.length} attachments uploaded successfully`,
      );
    }

    setPendingFiles(failedFiles);
    setUploadState('idle');
    return successfulUploads;
  };

  const queueOrUploadFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    if (submissionState === 'success') {
      await uploadFiles(files);
      return;
    }

    setPendingFiles((current) => {
      const existingKeys = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      );
      const additions = files.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
      });

      return [...current, ...additions];
    });

    toast.success(
      files.length === 1
        ? 'Attachment queued and will upload after submission'
        : `${files.length} attachments queued for upload after submission`,
    );
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    await queueOrUploadFiles(files);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid) {
      toast.error('Complete all required pricing and commercial terms before submitting.');
      return;
    }

    setSubmissionState('submitting');

    const payload: SupplierPortalQuotationPayload = {
      currency,
      validityDate: validity,
      paymentTerms,
      incoterms,
      notes: notes.trim(),
      items: rfq.items.map((item) => ({
        requisitionItemId: item.id,
        unitPrice: prices[item.id],
        leadTime: (leadTimes[item.id] ?? '').trim(),
        remarks: (remarks[item.id] ?? '').trim(),
      })),
    };

    try {
      const result = await submitQuotationMutation.mutateAsync(payload);
      const submittedAt = result?.submittedAt ?? new Date().toISOString();
      const totalAmount = Number(result?.totalAmount ?? subtotal);
      const quotationId = result?.quotationId ?? '';

      setSubmissionResult({
        quotationId,
        submittedAt,
        totalAmount,
        source: 'fresh',
      });
      setSubmissionState('success');
      toast.success('Quotation submitted successfully.');

      if (pendingFiles.length > 0) {
        await uploadFiles([...pendingFiles]);
      }
    } catch (error) {
      console.error(error);
      setSubmissionState('idle');
      const message = error instanceof Error ? error.message : 'Failed to submit quotation';
      if (message.toLowerCase().includes('already submitted')) {
        toast.error('Quotation already submitted.');
        onReload();
        return;
      }
      notifySupportError(error, { title: 'Failed to submit quotation' });
    }
  };

  if (submissionState === 'success' && submissionResult) {
    const successTitle =
      submissionResult.source === 'existing' ? 'Quotation Already Submitted' : 'Quotation Submitted';

    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileSelection}
        />
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl rounded-3xl border border-green-100 bg-white p-12 text-center shadow-xl"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 shadow-inner shadow-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900">{successTitle}</h2>
          <p className="mb-8 leading-relaxed text-gray-500">
            Your response to <strong>{rfq.referenceNumber}</strong> has been securely recorded for{' '}
            {rfq.issuingCompany}.
          </p>

          <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              Confirmation Details
            </p>
            <p className="text-sm font-medium text-gray-900">
              Timestamp: {new Date(submissionResult.submittedAt).toLocaleString()}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              Total Value:{' '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
                submissionResult.totalAmount,
              )}
            </p>
            {submissionResult.quotationId ? (
              <p className="mt-1 text-sm font-medium text-gray-900">
                Quotation ID: {submissionResult.quotationId}
              </p>
            ) : null}
          </div>

          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 text-left">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Upload your signed quotation, brochures, or certifications.
                </p>
              </div>
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploadState === 'uploading'}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadState === 'uploading' ? 'Uploading...' : 'Upload More'}
              </button>
            </div>
            {uploadedFiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                No attachments uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">{file.fileSize || 'Uploaded attachment'}</p>
                    </div>
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}

            {pendingFiles.length > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="text-sm font-bold text-amber-900">Pending uploads</p>
                <p className="mt-1 text-xs text-amber-800">
                  These files failed previously. You can retry them now.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingFiles.map((file, index) => (
                    <span
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-900"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void uploadFiles([...pendingFiles])}
                  disabled={uploadState === 'uploading'}
                  className="mt-4 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retry Pending Uploads
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
          >
            Download PDF Receipt
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 pb-32 sm:px-6 lg:px-8">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileSelection}
      />

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-10 text-white">
          <div className="pointer-events-none absolute right-0 top-0 opacity-10">
            <Building2 className="-mr-16 -mt-16 h-64 w-64" />
          </div>
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-400">
                Request For Quotation
              </p>
              <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">{rfq.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                <span className="flex items-center gap-1.5 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                  <FileText className="h-4 w-4 text-gray-400" />
                  {rfq.referenceNumber}
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {rfq.issuingCompany}
                </span>
              </div>
            </div>

            <div className="w-full min-w-[200px] rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md md:w-auto">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                Submission Deadline
              </p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-orange-400" />
                <span className="text-xl font-bold">
                  {new Date(rfq.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-8">
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-900">
              Description
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-600">
              {rfq.description || 'No description was provided for this RFQ.'}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={() => setTermsOpen((open) => !open)}
              className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-100/50"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                Terms & Conditions
              </span>
              {termsOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            <AnimatePresence>
              {termsOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="whitespace-pre-line px-6 pb-5 pt-2 text-sm leading-relaxed text-gray-600"
                >
                  {rfq.terms || 'No additional terms were provided for this RFQ.'}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-900">
              Attachments ({rfq.attachments.length})
            </h3>
            {rfq.attachments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-sm text-gray-500">
                No buyer attachments were included with this RFQ.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {rfq.attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-bold text-gray-900">{file.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-gray-500">{file.size}</p>
                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 transition-opacity group-hover:opacity-100 md:opacity-0"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 p-6 sm:flex-row">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quotation Response</h2>
              <p className="mt-1 text-xs text-gray-500">
                Provide your pricing and lead times for the requested items.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 sm:mt-0">
              <label className="text-sm font-bold text-gray-500">Currency:</label>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 border-b-2 border-gray-100 bg-white">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Item & Specifications
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    Req. Qty
                  </th>
                  <th className="w-48 px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Unit Price <span className="text-red-500">*</span>
                  </th>
                  <th className="w-40 px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Lead Time <span className="text-red-500">*</span>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rfq.items.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/50 focus-within:bg-blue-50/30"
                  >
                    <td className="min-w-[250px] whitespace-normal px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {item.specification}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="rounded-md bg-gray-100 px-3 py-1 font-black text-gray-900">
                        {item.quantity}
                      </span>
                      <span className="ml-1 text-xs font-medium text-gray-500">{item.unit}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-sm font-bold text-gray-400">
                            {getCurrencyMarker(currency)}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={prices[item.id] === undefined ? '' : prices[item.id]}
                          onChange={(event) => {
                            const value = event.target.value;
                            setPrices((current) => {
                              if (value === '') {
                                const next = { ...current };
                                delete next[item.id];
                                return next;
                              }

                              return { ...current, [item.id]: Number(value) };
                            });
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-4 text-sm font-bold text-gray-900 outline-none transition-all shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="text"
                        required
                        value={leadTimes[item.id] || ''}
                        onChange={(event) =>
                          setLeadTimes((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-all shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 5 days"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="text"
                        value={remarks[item.id] || ''}
                        onChange={(event) =>
                          setRemarks((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-none border-b border-transparent bg-transparent px-4 py-2.5 text-sm text-gray-900 outline-none transition-all hover:border-gray-200 focus:border-blue-500 focus:bg-white"
                        placeholder="Optional notes..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-900">
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-6 text-right text-xs font-bold uppercase tracking-widest text-gray-400"
                  >
                    Estimated Subtotal
                  </td>
                  <td colSpan={3} className="px-6 py-6 pl-[4.5rem]">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black tracking-tight text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
                          subtotal,
                        )}
                      </span>
                      {subtotal === 0 ? (
                        <span className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs font-medium text-gray-500">
                          Awaiting input
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-gray-100 bg-white p-8 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-600">
                Quotation Validity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  required
                  value={validity}
                  onChange={(event) => setValidity(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-600">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={paymentTerms}
                onChange={(event) => setPaymentTerms(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select terms...</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Cash in Advance">Cash in Advance</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-600">
                Delivery Terms <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={incoterms}
                onChange={(event) => setIncoterms(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Incoterms...</option>
                <option value="DDP - Delivered Duty Paid">DDP (Delivered Duty Paid)</option>
                <option value="DAP - Delivered at Place">DAP (Delivered at Place)</option>
                <option value="EXW - Ex Works">EXW (Ex Works)</option>
                <option value="FOB - Free on Board">FOB (Free on Board)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 px-8 pb-8">
            <label className="mb-2 mt-8 block text-xs font-bold uppercase tracking-widest text-gray-600">
              Supplier Notes
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500"
              placeholder="Add any overall notes for your quotation..."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Supporting Documents</h3>
            <p className="mt-1 text-xs text-gray-500">
              Queue your official quotation PDF, spec sheets, or certifications. They will upload
              automatically after submission.
            </p>
          </div>

          <button
            type="button"
            onClick={openFilePicker}
            className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Drag & drop files here</h4>
            <p className="mb-4 mt-1 text-xs text-gray-500">Or click to browse from your computer</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              PDF, DOCX, XLSX, images (Max 10MB each)
            </span>
          </button>

          {pendingFiles.length > 0 ? (
            <div className="mt-6 space-y-3">
              {pendingFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Total Quotation Value
              </p>
              <p className="text-xl font-black text-gray-900">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}
              </p>
            </div>

            <div className="flex w-full gap-4 sm:w-auto">
              <button
                type="button"
                onClick={openFilePicker}
                className="hidden w-full rounded-xl bg-gray-100 px-6 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-200 sm:block sm:w-auto"
                disabled={submissionState !== 'idle' || uploadState === 'uploading'}
              >
                Add Attachments
              </button>
              <button
                type="submit"
                disabled={!isFormValid || submissionState !== 'idle'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:w-auto"
              >
                {submissionState === 'submitting' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    Submit Quotation
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
