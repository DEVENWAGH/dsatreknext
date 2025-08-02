-- Complete fix for is_verified column type conversion
-- This migration handles the conversion from text to boolean with proper data migration

DO $$
BEGIN
    -- Check if the column is currently text type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_verified' 
        AND data_type = 'text'
    ) THEN
        -- Step 1: Add temporary boolean column
        ALTER TABLE users ADD COLUMN is_verified_new boolean DEFAULT false;
        
        -- Step 2: Migrate data safely
        UPDATE users SET is_verified_new = CASE 
            WHEN is_verified = 'true' THEN true
            WHEN is_verified = 'false' THEN false
            ELSE false
        END;
        
        -- Step 3: Drop old column and rename new one
        ALTER TABLE users DROP COLUMN is_verified;
        ALTER TABLE users RENAME COLUMN is_verified_new TO is_verified;
        
        -- Step 4: Set constraints
        ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
        ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT false;
        
        RAISE NOTICE 'Successfully converted is_verified from text to boolean';
    ELSE
        -- If already boolean, just ensure NOT NULL constraint
        ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
        RAISE NOTICE 'Column is_verified is already boolean, set NOT NULL constraint';
    END IF;
END $$;
