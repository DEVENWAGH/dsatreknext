ALTER TABLE "problems" ADD COLUMN "wrapper_code" jsonb;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "reference_solution" jsonb;--> statement-breakpoint
ALTER TABLE "problems" DROP COLUMN "solution";