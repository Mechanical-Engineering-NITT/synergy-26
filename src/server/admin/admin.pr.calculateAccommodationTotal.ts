import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { requireAdminUser } from "@/lib/utils";
import { getConstantValue } from "../constants";

const CalculateAccommodationTotalInputSchema = z.object({
	nightsRequested: z.number().int().positive(),
});

const parseRoomPrice = (value: string | null) => {
	if (value === null) {
		throw new Error("Missing constant value for key: room");
	}

	const parsedValue = Number(value);
	if (Number.isNaN(parsedValue) || parsedValue <= 0) {
		throw new Error("Invalid numeric constant value for key: room");
	}

	return parsedValue;
};

export const calculateAccommodationTotal = createServerFn({ method: "POST" })
	.inputValidator(CalculateAccommodationTotalInputSchema)
	.handler(async ({ data }) => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });

		const roomValue = await getConstantValue("room");
		const roomPrice = parseRoomPrice(roomValue);
		const total = roomPrice * data.nightsRequested;

		return {
			roomPrice,
			total,
		};
	});
