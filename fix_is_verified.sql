-- Fix is_verified column to be boolean with default false

-- Step 1: Update any existing text values to boolean-compatible values
UPDATE users 
SET is_verified = 'false' 
WHERE is_verified IS NULL OR is_verified NOT IN ('true', 'false');

UPDATE users 
SET is_verified = 'false' 
WHERE is_verified = 'false' OR is_verified = '0' OR is_verified = 'f';

UPDATE users 
SET is_verified = 'true' 
WHERE is_verified = 'true' OR is_verified = '1' OR is_verified = 't';

-- Step 2: Drop any existing default constraint
ALTER TABLE users ALTER COLUMN is_verified DROP DEFAULT;

-- Step 3: Convert column to boolean type
ALTER TABLE users 
ALTER COLUMN is_verified TYPE boolean 
USING CASE 
    WHEN is_verified::text = 'true' THEN true 
    ELSE false 
END;

-- Step 4: Add NOT NULL constraint and set default to false
ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false;

-- Step 5: Update any remaining NULL values (if any)
UPDATE users SET is_verified = false WHERE is_verified IS NULL;
