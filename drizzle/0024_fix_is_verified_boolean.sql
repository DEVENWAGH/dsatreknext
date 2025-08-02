-- Fix is_verified column to be proper boolean type with default false

-- First, check if the column exists and what type it is
-- Update any text values to proper boolean values if they exist
UPDATE "users" SET "is_verified" = 'true' WHERE "is_verified"::text = 'true';
UPDATE "users" SET "is_verified" = 'false' WHERE "is_verified"::text = 'false' OR "is_verified" IS NULL;

-- Drop any existing default constraint safely
ALTER TABLE "users" ALTER COLUMN "is_verified" DROP DEFAULT;

-- Convert the column to boolean type using explicit casting
ALTER TABLE "users" 
ALTER COLUMN "is_verified" TYPE boolean 
USING CASE 
    WHEN "is_verified"::text = 'true' OR "is_verified"::boolean = true THEN true 
    ELSE false 
END;

-- Set the new boolean default
ALTER TABLE "users" ALTER COLUMN "is_verified" SET DEFAULT false;

-- Ensure all existing users have a valid boolean value
UPDATE "users" SET "is_verified" = false WHERE "is_verified" IS NULL;
