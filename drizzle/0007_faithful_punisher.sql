-- First, update invalid JSON data to null
UPDATE "problems" SET "solution" = NULL WHERE "solution" = '[object Object]' OR "solution" NOT LIKE '{%';

-- Then convert the column type
ALTER TABLE "problems" ALTER COLUMN "solution" SET DATA TYPE jsonb USING 
  CASE 
    WHEN "solution" IS NULL THEN NULL
    ELSE "solution"::jsonb
  END;