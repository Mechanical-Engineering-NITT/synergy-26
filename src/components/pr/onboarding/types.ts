export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StayFullDetails = {
	exists: boolean;
	accommodationRequired: boolean;
	nightsRequested: number;
	accommodationFee: number;
	cautionDeposit: number;
	fineAmount: number;
	finePaid: boolean;
	cautionReturned: boolean;
	checkedInAt: Date | null;
	checkedOutAt: Date | null;
	elapsedDays: number;
	overstayed: boolean;
};

export type CheckInMode = "create" | "edit";

export type CheckInState = {
	step: WizardStep;
	accommodationRequired: boolean | null;
	nightsRequested: number;
	originalNightsRequested: number;
	originalAccommodationFee: number;
	paymentVerified: boolean;
	depositVerified: boolean;
	hostelName: string | null;
	floor: string | null;
	roomPrice: number;
	accommodationPreviewTotal: number;
	remainingToPay: number;
};

export type CheckOutState = {
	step: WizardStep;
	fineApplicable: boolean | null;
	fineAmount: number;
	finePaid: boolean;
	cautionReturned: boolean;
};

export type CheckInAction =
	| { type: "setAccommodationRequired"; value: boolean | null }
	| { type: "setNightsRequested"; value: number }
	| { type: "setPaymentVerified"; value: boolean }
	| { type: "setDepositVerified"; value: boolean }
	| { type: "setHostelName"; value: string | null }
	| { type: "setFloor"; value: string | null }
	| {
			type: "hydrateFromEdit";
			value: {
				accommodationRequired: boolean;
				nightsRequested: number;
				originalNightsRequested: number;
				originalAccommodationFee: number;
				accommodationPreviewTotal: number;
				paymentVerified: boolean;
				hostelName: string | null;
				floor: string | null;
			};
	  }
	| {
			type: "setPricingPreview";
			roomPrice: number;
			accommodationPreviewTotal: number;
			remainingToPay: number;
	  }
	| { type: "nextStep" }
	| { type: "prevStep" }
	| { type: "reset" };

export type CheckOutAction =
	| { type: "setFineApplicable"; value: boolean | null }
	| { type: "setFineAmount"; value: number }
	| { type: "setFinePaid"; value: boolean }
	| { type: "setCautionReturned"; value: boolean }
	| { type: "nextStep" }
	| { type: "prevStep" }
	| { type: "reset" };
