-- Ensure is_verified column exists and has proper default
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false;

-- Update existing users without verification status to false
UPDATE "users" SET "is_verified" = false WHERE "is_verified" IS NULL;

-- Set users with OAuth providers (Google/GitHub) as verified since they don't need email verification
UPDATE "users" SET "is_verified" = true WHERE "password" = '' OR "password" IS NULL;