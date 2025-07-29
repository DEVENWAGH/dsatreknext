CREATE TABLE IF NOT EXISTS "daily_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"challenge_date" date NOT NULL,
	"month" text NOT NULL,
	"day" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_challenge_date_idx" ON "daily_challenges" ("challenge_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_challenge_month_idx" ON "daily_challenges" ("month");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_challenge_date" ON "daily_challenges" ("challenge_date");