CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"github_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "password_reset_email_idx" ON "password_resets" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_reset_otp_idx" ON "password_resets" USING btree ("otp");--> statement-breakpoint
CREATE INDEX "user_profile_user_id_idx" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "linkedin_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "portfolio_url";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_otp";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_otp_expiry";