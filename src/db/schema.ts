import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.ts";

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const customUser = pgTable("custom-user", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("userId")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	fullname: text("fullname").notNull(),
	college: text("college").notNull(),
	city: text("city").notNull(),
	department: text("department").notNull(),
	year: text("year").notNull(),
	phone: text("phone").notNull(),
	gender: text("gender").notNull(),
});

export const events = pgTable("events", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	time: timestamp("time").notNull(),
	location: text("location").notNull(),
	price: text("price").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const workshops = pgTable("workshops", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	time: timestamp("time").notNull(),
	location: text("location").notNull(),
	price: text("price").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
