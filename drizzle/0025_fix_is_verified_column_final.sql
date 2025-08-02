-- Fix is_verified column to be proper boolean type with default false
-- This migration handles all edge cases and data states

-- Step 1: Create a temporary column with the correct boolean type
ALTER TABLE "users" ADD COLUMN "is_verified_new" boolean DEFAULT false;

-- Step 2: Update the new column based on existing data
UPDATE "users" SET "is_verified_new" = CASE 
    WHEN "is_verified"::text = 'true' OR "is_verified" = true THEN true
    WHEN "is_verified"::text = 'false' OR "is_verified" = false THEN false
    ELSE false
END;

-- Step 3: Set NOT NULL constraint after data migration
ALTER TABLE "users" ALTER COLUMN "is_verified_new" SET NOT NULL;

-- Step 4: Drop the old column
ALTER TABLE "users" DROP COLUMN "is_verified";

-- Step 5: Rename the new column to the original name
ALTER TABLE "users" RENAME COLUMN "is_verified_new" TO "is_verified";

-- Step 6: Ensure the default is properly set
ALTER TABLE "users" ALTER COLUMN "is_verified" SET DEFAULT false;
