CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"radius" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscriptions_email_unique" UNIQUE("email")
);
