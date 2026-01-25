import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "@/db";
import { constants } from "@/db/schema";
import { parseAndThrow } from "@/lib/utils";

const GetConstantInput = z.object({
	key: z.string().min(1),
});

export const getConstantValue = createServerOnlyFn(async (key: string) => {
	const [result] = await db
		.select()
		.from(constants)
		.where(eq(constants.key, key))
		.limit(1);

	return result?.value ?? null;
});

export const getConstant = createServerFn({ method: "POST" })
	.inputValidator(GetConstantInput)
	.handler(async ({ data }) => {
		const parsedData = parseAndThrow(data, GetConstantInput);
		return getConstantValue(parsedData.key);
	});
