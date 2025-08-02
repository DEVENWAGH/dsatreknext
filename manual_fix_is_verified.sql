-- Manual fix for is_verified column
-- Run this directly on your database to convert the column from text to boolean

-- First, let's check the current state of the column
-- You can uncomment the line below to see current data types
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified';

-- Method 1: Safe column replacement (recommended)
BEGIN;

-- Add a new boolean column
ALTER TABLE users ADD COLUMN is_verified_temp boolean DEFAULT false;

-- Migrate data from text to boolean
UPDATE users SET is_verified_temp = CASE 
    WHEN is_verified::text = 'true' THEN true
    WHEN is_verified::text = 'false' THEN false
    ELSE false
END;

-- Drop the old column
ALTER TABLE users DROP COLUMN is_verified;

-- Rename the new column
ALTER TABLE users RENAME COLUMN is_verified_temp TO is_verified;

-- Set NOT NULL constraint and default
ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false;

COMMIT;

-- Verify the change
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_verified';
