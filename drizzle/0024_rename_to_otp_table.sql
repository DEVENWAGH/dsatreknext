-- Rename password_resets table to otps
ALTER TABLE "password_resets" RENAME TO "otps";

-- Add type column for different OTP purposes
ALTER TABLE "otps" ADD COLUMN "type" text NOT NULL DEFAULT 'password_reset';

-- Update existing records to have password_reset type
UPDATE "otps" SET "type" = 'password_reset' WHERE "type" IS NULL;

-- Rename indexes
DROP INDEX IF EXISTS "password_reset_email_idx";
DROP INDEX IF EXISTS "password_reset_otp_idx";

CREATE INDEX "otp_email_idx" ON "otps" ("email");
CREATE INDEX "otp_code_idx" ON "otps" ("otp");
CREATE INDEX "otp_type_idx" ON "otps" ("type");