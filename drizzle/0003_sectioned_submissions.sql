ALTER TABLE "form_fields" ADD COLUMN "section_key" varchar(80) DEFAULT 'general_information' NOT NULL;
--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "section_position" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "idea_versions" ADD COLUMN "terms_accepted_at" timestamp with time zone;
