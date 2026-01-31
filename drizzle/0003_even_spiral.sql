ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "accommodation";