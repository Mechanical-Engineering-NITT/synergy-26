CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN-PR', 'ADMIN-MASTER');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE role USING "role"::role;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER'::role;