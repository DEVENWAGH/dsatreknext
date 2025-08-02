-- Add isActive column to problems table
ALTER TABLE problems ADD COLUMN is_active BOOLEAN DEFAULT true;