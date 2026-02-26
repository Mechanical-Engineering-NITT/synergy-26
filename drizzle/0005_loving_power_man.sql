CREATE TYPE "public"."role" AS ENUM('USER', 'PR', 'MASTER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE role;