CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"otp" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" text DEFAULT 'false',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "password_resets" CASCADE;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "otps" USING btree ("email");--> statement-breakpoint
CREATE INDEX "otp_code_idx" ON "otps" USING btree ("otp");--> statement-breakpoint
CREATE INDEX "otp_type_idx" ON "otps" USING btree ("type");