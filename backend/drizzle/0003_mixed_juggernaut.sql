CREATE TABLE "ministration_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer DEFAULT 1 NOT NULL,
	"submitted_by" text NOT NULL,
	"students_present" integer NOT NULL,
	"ministers_present" integer NOT NULL,
	"topic" text,
	"challenges" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
