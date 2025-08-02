CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text,
	"name" text,
	"message" text NOT NULL,
	"type" text DEFAULT 'general',
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "birthday" date;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "twitter_url" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "experience" json;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "education" json;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "skills" json;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");