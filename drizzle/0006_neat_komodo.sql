ALTER TYPE "public"."role" RENAME VALUE 'ADMIN-PR' TO 'PR';--> statement-breakpoint
ALTER TYPE "public"."role" RENAME VALUE 'ADMIN-MASTER' TO 'MASTER';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'ADMIN';
