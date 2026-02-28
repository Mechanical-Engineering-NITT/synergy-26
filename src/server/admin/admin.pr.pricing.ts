import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { getConstantValue } from "../constants";

type PricingResult = {
	roomPrice: number;
	depositAmount: number;
};

const parsePrices = (key: "room" | "deposit", value: string | null) => {
	if (value === null) {
		throw new Error(`Missing constant value for key: ${key}`);
	}

	const parsedValue = Number(value);
	if (Number.isNaN(parsedValue)) {
		throw new Error(`Invalid numeric constant value for key: ${key}`);
	}

	return parsedValue;
};

export const getAccommodationPricing = async (): Promise<PricingResult> => {
	const [roomValue, depositValue] = await Promise.all([
		getConstantValue("room"),
		getConstantValue("deposit"),
	]);

	return {
		roomPrice: parsePrices("room", roomValue),
		depositAmount: parsePrices("deposit", depositValue),
	};
};

const CheckInPricingPreviewInputSchema = z.object({
	accommodationRequired: z.boolean(),
	nightsRequested: z.number().int().min(0),
});

export const getCheckInPricingPreview = createServerFn({ method: "POST" })
	.inputValidator(CheckInPricingPreviewInputSchema)
	.handler(async () => {
		const { roomPrice, depositAmount } = await getAccommodationPricing();

		return {
			roomPrice,
			depositAmount,
		};
	});
