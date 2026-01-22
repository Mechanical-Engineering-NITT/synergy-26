import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { workshops } from "@/db/schema";

export const getAllWorkshops = createServerFn().handler(async () => {
	return await db.select().from(workshops);
});
