DROP INDEX "interview_user_idx";--> statement-breakpoint
DROP INDEX "interview_status_idx";--> statement-breakpoint
ALTER TABLE "interviews" ALTER COLUMN "difficulty" SET DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;