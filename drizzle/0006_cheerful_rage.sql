DROP INDEX "problem_company_idx";--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "companies" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
UPDATE "problems" SET "companies" = CASE 
  WHEN "company_id" IS NOT NULL THEN jsonb_build_array("company_id") 
  ELSE '[]'::jsonb 
END;--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "company_id";