CREATE TABLE "my-chatbot_saved_events" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"dateTime" varchar(256),
	"location" text,
	"link" text,
	"userId" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "my-chatbot_saved_events" ADD CONSTRAINT "my-chatbot_saved_events_userId_my-chatbot_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."my-chatbot_user"("id") ON DELETE cascade ON UPDATE no action;