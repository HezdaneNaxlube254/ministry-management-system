CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"field_label" text,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "schools_name_unique" UNIQUE("name"),
	CONSTRAINT "schools_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "ministration_reports" ALTER COLUMN "school_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ministration_reports" ADD COLUMN "submitted_by_id" integer;--> statement-breakpoint
ALTER TABLE "ministration_reports" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ministration_reports" ADD COLUMN "recommendations" text;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "transaction_cost" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "school_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "venue" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "dynamic_field" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministration_reports" ADD CONSTRAINT "ministration_reports_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministration_reports" ADD CONSTRAINT "ministration_reports_submitted_by_id_people_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;