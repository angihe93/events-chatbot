CREATE TABLE "my-chatbot_events_query_daily" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"userId" varchar(256) NOT NULL,
	"query" text NOT NULL,
	"date" varchar(256),
	"queryCreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my-chatbot_events_query_daily" ADD CONSTRAINT "my-chatbot_events_query_daily_userId_my-chatbot_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."my-chatbot_user"("id") ON DELETE cascade ON UPDATE no action;