CREATE TABLE "accommodation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"accommodation_required" boolean DEFAULT false NOT NULL,
	"nights_requested" integer DEFAULT 0 NOT NULL,
	"accommodation_fee" integer DEFAULT 0 NOT NULL,
	"caution_deposit" integer DEFAULT 0 NOT NULL,
	"hostel_name" text,
	"floor" text,
	"room_number" text,
	"payment_verified" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp,
	"fine_amount" integer,
	"fine_paid" boolean,
	"caution_returned" boolean,
	"checked_out_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accommodation" ADD CONSTRAINT "accommodation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accommodation_user_id_unique_idx" ON "accommodation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accommodation_user_id_idx" ON "accommodation" USING btree ("user_id");