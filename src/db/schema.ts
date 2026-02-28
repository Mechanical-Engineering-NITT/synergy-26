import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";
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
	longDescription: text("long_description").notNull().default(""),
	time: text("time").notNull(),
	location: text("location").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const constants = pgTable("constants", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export const workshops = pgTable("workshops", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	longDescription: text("long_description").notNull().default(""),
	time: text("time").notNull(),
	location: text("location").notNull(),
	price: text("price").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const paymentStatusEnum = pgEnum("payment_status", [
	"created",
	"attempted",
	"paid",
	"failed",
]);

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	razorpayOrderId: text("razorpay_order_id").notNull().unique(),
	razorpayPaymentId: text("razorpay_payment_id"),
	amount: integer("amount").notNull(), // in paise
	currency: text("currency").default("INR"),
	status: paymentStatusEnum("status").notNull().default("created"),
	userId: text("user_id")
		.references(() => user.id)
		.notNull(),
	workshopId: integer("workshop_id").references(() => workshops.id), // if payment is for a specific workshop
	isEventPass: boolean("is_event_pass").default(false), // if true, payment grants access to all events
	webhookEventId: text("webhook_event_id"), // for idempotency
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	eventId: integer("event_id").references(() => events.id),
	workshopId: integer("workshop_id").references(() => workshops.id),
	createdAt: timestamp("created_at").defaultNow(),
});

export const accommodation = pgTable(
	"accommodation",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		accommodationRequired: boolean("accommodation_required")
			.notNull()
			.default(false),
		nightsRequested: integer("nights_requested").notNull().default(0),
		accommodationFee: integer("accommodation_fee").notNull().default(0),
		cautionDeposit: integer("caution_deposit").notNull().default(0),
		hostelName: text("hostel_name"),
		floor: text("floor"),
		paymentVerified: boolean("payment_verified").notNull().default(false),
		checkedInAt: timestamp("checked_in_at"),
		fineAmount: integer("fine_amount"),
		finePaid: boolean("fine_paid"),
		cautionReturned: boolean("caution_returned"),
		checkedOutAt: timestamp("checked_out_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("accommodation_user_id_unique_idx").on(table.userId),
		index("accommodation_user_id_idx").on(table.userId),
	],
);
