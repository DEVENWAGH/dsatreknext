CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" varchar(32) NOT NULL,
	"plan_name" varchar(64),
	"razorpay_order_id" varchar(128),
	"razorpay_payment_id" varchar(128),
	"status" varchar(32) DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
