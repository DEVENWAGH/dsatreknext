CREATE TABLE "community_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text NOT NULL,
	"title" text,
	"content" jsonb NOT NULL,
	"topic" text DEFAULT 'Interview',
	"parent_id" uuid,
	"is_anonymous" boolean DEFAULT false,
	"upvotes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "community_message_created_idx" ON "community_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "community_message_expires_idx" ON "community_messages" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "community_message_user_idx" ON "community_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "community_message_parent_idx" ON "community_messages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "community_upvote_user_message_idx" ON "community_upvotes" USING btree ("user_id","message_id");