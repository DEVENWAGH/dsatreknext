-- Final migration to convert is_verified from text to boolean with proper default

-- Step 1: Handle any existing data by normalizing text values
DO $$
BEGIN
    -- First, ensure the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        
        -- Normalize existing text values
        UPDATE "users" 
        SET "is_verified" = CASE 
            WHEN "is_verified"::text IN ('true', 't', '1', 'yes', 'y') THEN 'true'
            ELSE 'false'
        END;
        
        -- Drop any existing default constraint
        BEGIN
            ALTER TABLE "users" ALTER COLUMN "is_verified" DROP DEFAULT;
        EXCEPTION
            WHEN OTHERS THEN NULL; -- Ignore if no default exists
        END;
        
        -- Convert column to boolean type
        ALTER TABLE "users" 
        ALTER COLUMN "is_verified" TYPE boolean 
        USING (
            CASE 
                WHEN "is_verified"::text = 'true' THEN true 
                ELSE false 
            END
        );
        
        -- Set NOT NULL constraint
        ALTER TABLE "users" ALTER COLUMN "is_verified" SET NOT NULL;
        
        -- Set default value
        ALTER TABLE "users" ALTER COLUMN "is_verified" SET DEFAULT false;
        
        -- Update any NULL values (though there shouldn't be any after NOT NULL)
        UPDATE "users" SET "is_verified" = false WHERE "is_verified" IS NULL;
        
    END IF;
END $$;

-- Verify the change
DO $$
BEGIN
    -- Check if the column is now boolean type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_verified' 
        AND data_type = 'boolean'
    ) THEN
        RAISE EXCEPTION 'Migration failed: is_verified column is not boolean type';
    END IF;
END $$;
