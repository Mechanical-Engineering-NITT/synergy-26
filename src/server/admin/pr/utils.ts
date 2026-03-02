import { requireAdminUser } from "@/lib/utils";
import { getConstantValue } from "@/server/constants";

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
	await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
	const [roomValue, depositValue] = await Promise.all([
		getConstantValue("room"),
		getConstantValue("deposit"),
	]);

	return {
		roomPrice: parsePrices("room", roomValue),
		depositAmount: parsePrices("deposit", depositValue),
	};
};
