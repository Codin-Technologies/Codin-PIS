'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSupplierPortalRfqAction,
  submitSupplierPortalQuotationAction,
  uploadSupplierPortalAttachmentAction,
  type SupplierPortalQuotationPayload,
} from '@/app/actions/rfqPortal';
import { queryKeys } from '@/lib/query-keys';

export function useSupplierPortalRfq(token: string) {
  return useQuery({
    queryKey: queryKeys.supplierPortalRfq(token),
    queryFn: () => getSupplierPortalRfqAction(token),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitSupplierPortalQuotation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupplierPortalQuotationPayload) =>
      submitSupplierPortalQuotationAction(token, payload),
    meta: { disableGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplierPortalRfq(token) });
    },
  });
}

export function useUploadSupplierPortalAttachment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadSupplierPortalAttachmentAction(token, file),
    meta: { disableGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplierPortalRfq(token) });
    },
  });
}
