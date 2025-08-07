-- Add missing columns to interviews table if they don't exist
DO $$
BEGIN
    -- Add transcript column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' AND column_name = 'transcript'
    ) THEN
        ALTER TABLE "interviews" ADD COLUMN "transcript" jsonb;
    END IF;
    
    -- Add responses column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' AND column_name = 'responses'
    ) THEN
        ALTER TABLE "interviews" ADD COLUMN "responses" jsonb;
    END IF;
END $$;
