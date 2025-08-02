ALTER TABLE "users" ALTER COLUMN "is_verified" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "is_premium" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN "updated_at";