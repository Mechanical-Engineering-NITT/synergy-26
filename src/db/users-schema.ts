import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	userid: text("userid")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	fullname: text("fullname"),
	college: text("college"),
	city: text("city"),
	department: text("department"),
	year: text("year"),
	phone: text("phone"),
	gender: text("gender"),
});
