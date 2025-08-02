-- Add updated_at column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update existing comments to have updated_at = created_at
UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL;