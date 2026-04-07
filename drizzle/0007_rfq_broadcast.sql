CREATE TABLE "rfq_quotation_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rfq_quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"requisition_item_id" uuid NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"lead_time" text NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rfq_quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"token_id" uuid NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"validity_date" text NOT NULL,
	"payment_terms" text NOT NULL,
	"incoterms" text NOT NULL,
	"notes" text,
	"total_amount" numeric(14, 2),
	"status" text DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "rfq_quotations_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "rfq_supplier_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "rfq_supplier_tokens_token_unique" UNIQUE("token"),
	CONSTRAINT "rfq_supplier_tokens_rfq_id_supplier_id_unique" UNIQUE("rfq_id","supplier_id")
);
--> statement-breakpoint
ALTER TABLE "inventory_items" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency_display" text DEFAULT 'symbol' NOT NULL;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "terms" text;--> statement-breakpoint
ALTER TABLE "rfq_quotation_attachments" ADD CONSTRAINT "rfq_quotation_attachments_quotation_id_rfq_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."rfq_quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_quotation_items" ADD CONSTRAINT "rfq_quotation_items_quotation_id_rfq_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."rfq_quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_quotation_items" ADD CONSTRAINT "rfq_quotation_items_requisition_item_id_requisition_items_id_fk" FOREIGN KEY ("requisition_item_id") REFERENCES "public"."requisition_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_quotations" ADD CONSTRAINT "rfq_quotations_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_quotations" ADD CONSTRAINT "rfq_quotations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_quotations" ADD CONSTRAINT "rfq_quotations_token_id_rfq_supplier_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."rfq_supplier_tokens"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_supplier_tokens" ADD CONSTRAINT "rfq_supplier_tokens_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_supplier_tokens" ADD CONSTRAINT "rfq_supplier_tokens_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;