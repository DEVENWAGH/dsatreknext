CREATE TABLE "daily_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"challenge_date" date NOT NULL,
	"month" text NOT NULL,
	"day" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_challenge_date" UNIQUE("challenge_date")
);
--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_challenge_date_idx" ON "daily_challenges" USING btree ("challenge_date");--> statement-breakpoint
CREATE INDEX "daily_challenge_month_idx" ON "daily_challenges" USING btree ("month");