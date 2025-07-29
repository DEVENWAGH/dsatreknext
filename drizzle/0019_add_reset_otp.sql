ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_otp_expiry" timestamp;