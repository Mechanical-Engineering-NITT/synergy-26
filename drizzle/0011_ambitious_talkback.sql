CREATE TYPE "public"."floor_enum" AS ENUM('Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor');--> statement-breakpoint
CREATE TYPE "public"."hostel_enum" AS ENUM('Zircon A', 'Zircon B', 'Zircon C', 'Opal A');--> statement-breakpoint
ALTER TABLE "accommodation" ALTER COLUMN "hostel_name" TYPE hostel_enum USING "hostel_name"::hostel_enum;--> statement-breakpoint
ALTER TABLE "accommodation" ALTER COLUMN "floor" TYPE floor_enum USING "floor"::floor_enum;--> statement-breakpoint