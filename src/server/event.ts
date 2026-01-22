import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { events } from "@/db/schema";

export const getAllEvents = createServerFn().handler(async () => {
	return await db.select().from(events);
});
