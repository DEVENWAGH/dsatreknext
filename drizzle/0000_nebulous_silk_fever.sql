CREATE TABLE "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company_url" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"upvotes" text DEFAULT '0',
	"downvotes" text DEFAULT '0',
	"is_resolved" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"interviewer_name" text,
	"company_name" text,
	"position" text,
	"duration" text,
	"difficulty" text,
	"questions" jsonb,
	"feedback" text,
	"rating" text,
	"status" text DEFAULT 'scheduled',
	"scheduled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"is_public" text DEFAULT 'false',
	"problem_ids" jsonb,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text NOT NULL,
	"tags" jsonb,
	"examples" jsonb,
	"constraints" text,
	"starter_code" jsonb,
	"solution" text,
	"hints" jsonb,
	"company_id" uuid,
	"is_active" text DEFAULT 'true',
	"total_submissions" text DEFAULT '0',
	"accepted_submissions" text DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"status" text NOT NULL,
	"runtime" text,
	"memory" text,
	"test_cases_passed" text,
	"total_test_cases" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'user',
	"is_verified" text DEFAULT 'false',
	"profile_picture" text,
	"bio" text,
	"github_url" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"current_streak" text DEFAULT '0',
	"max_streak" text DEFAULT '0',
	"total_problems" text DEFAULT '0',
	"easy_problems" text DEFAULT '0',
	"medium_problems" text DEFAULT '0',
	"hard_problems" text DEFAULT '0',
	"is_subscribed" text DEFAULT 'false',
	"subscription_plan" text,
	"subscription_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "accounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" bigint,
	"id_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	"sessionToken" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"expires" timestamp NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX "company_name_idx" ON "company" USING btree ("name");--> statement-breakpoint
CREATE INDEX "discussion_user_idx" ON "discussions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discussion_problem_idx" ON "discussions" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "interview_user_idx" ON "interviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interview_status_idx" ON "interviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "playlist_user_idx" ON "playlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "playlist_public_idx" ON "playlists" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "problem_difficulty_idx" ON "problems" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "problem_company_idx" ON "problems" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "submission_user_idx" ON "submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_problem_idx" ON "submissions" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "submission_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_username_idx" ON "users" USING btree ("username");