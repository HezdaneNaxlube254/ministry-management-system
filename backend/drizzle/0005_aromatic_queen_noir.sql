CREATE TABLE "terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"opening_balance" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "targets" DROP CONSTRAINT "targets_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "counterparty" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "parent_transaction_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_balance_marker" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;