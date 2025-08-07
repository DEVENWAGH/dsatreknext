ALTER TABLE "problems" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "transcript" jsonb;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "responses" jsonb;