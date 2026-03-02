import type { CheckOutAction, CheckOutState, WizardStep } from "../types";

export const createInitialCheckOutState = ({
	isNoAccommodation = false,
}: {
	isNoAccommodation?: boolean;
} = {}): CheckOutState => ({
	step: 1,
	fineApplicable: isNoAccommodation ? false : null,
	fineAmount: 0,
	finePaid: false,
	cautionReturned: false,
});

export const buildInitialCheckoutStateFromStay = (stay: {
	accommodationRequired: boolean;
	fineAmount: number;
	finePaid: boolean;
	cautionReturned: boolean;
}): CheckOutState => {
	if (!stay.accommodationRequired) {
		return {
			step: 1,
			fineApplicable: false,
			fineAmount: 0,
			finePaid: false,
			cautionReturned: false,
		};
	}

	const fineAmount = stay.fineAmount ?? 0;

	return {
		step: 1,
		fineApplicable: fineAmount > 0,
		fineAmount,
		finePaid: stay.finePaid ?? false,
		cautionReturned: stay.cautionReturned ?? false,
	};
};

export const getCheckOutNextStep = (
	state: CheckOutState,
	stay: { accommodationRequired: boolean } | null | undefined,
) => {
	const isNoAccommodation = stay?.accommodationRequired === false;

	if (isNoAccommodation) {
		switch (state.step) {
			case 1:
				return 2;
			case 2:
				return 3;
			default:
				return state.step;
		}
	}

	if (state.step === 1) {
		return 2;
	}

	if (state.step === 2) {
		if (state.fineApplicable === false) {
			return 5;
		}

		if (state.fineApplicable === true) {
			return 3;
		}

		return 2;
	}

	if (state.step === 3) {
		return 4;
	}

	if (state.step === 4) {
		return 6;
	}

	if (state.step === 5) {
		return 6;
	}

	if (state.step === 6) {
		return 7;
	}

	return state.step;
};

export const getCheckOutPreviousStep = (
	state: CheckOutState,
	stay: { accommodationRequired: boolean } | null | undefined,
) => {
	const isNoAccommodation = stay?.accommodationRequired === false;

	if (isNoAccommodation) {
		switch (state.step) {
			case 3:
				return 2;
			case 2:
				return 1;
			default:
				return 1;
		}
	}

	if (state.step === 5 && state.fineApplicable === false) {
		return 2;
	}

	if (state.step === 6 && state.fineApplicable === true) {
		return 4;
	}

	const defaultBack: Record<2 | 3 | 4 | 5 | 6 | 7, WizardStep> = {
		2: 1,
		3: 2,
		4: 3,
		5: 4,
		6: 5,
		7: 6,
	};

	return defaultBack[state.step as 2 | 3 | 4 | 5 | 6 | 7] ?? 1;
};

export const isCheckOutFinalStateValid = ({
	checkedInAt,
	state,
}: {
	checkedInAt: Date | null;
	state: CheckOutState;
}) =>
	Boolean(checkedInAt) &&
	(state.fineApplicable === true
		? state.fineAmount > 0 &&
			state.finePaid === true &&
			state.cautionReturned === false
		: state.fineApplicable === false
			? state.fineAmount === 0 &&
				state.finePaid === false &&
				state.cautionReturned === true
			: false);

export const checkOutReducer = (
	state: CheckOutState,
	action: CheckOutAction,
): CheckOutState => {
	switch (action.type) {
		case "INITIALIZE_FROM_STAY":
			return buildInitialCheckoutStateFromStay(action.payload);
		case "setFineApplicable":
			if (action.value === false) {
				return {
					...state,
					fineApplicable: false,
					fineAmount: 0,
					finePaid: false,
					cautionReturned: true,
				};
			}

			if (action.value === true) {
				return {
					...state,
					fineApplicable: true,
					finePaid: false,
					cautionReturned: false,
				};
			}

			return {
				...state,
				fineApplicable: null,
				fineAmount: 0,
				finePaid: false,
				cautionReturned: false,
			};
		case "setFineAmount":
			return {
				...state,
				fineAmount: action.value,
				finePaid: false,
			};
		case "setFinePaid":
			return {
				...state,
				finePaid: state.fineApplicable === true ? action.value : false,
			};
		case "setCautionReturned":
			if (state.fineApplicable === true) {
				return { ...state, cautionReturned: false };
			}

			return { ...state, cautionReturned: action.value };
		case "hydrateFromEdit":
			return {
				...state,
				step: 1,
				fineApplicable: action.value.fineApplicable,
				fineAmount: action.value.fineAmount,
				finePaid: action.value.finePaid,
				cautionReturned: action.value.cautionReturned,
			};
		case "nextStep":
			return { ...state, step: getCheckOutNextStep(state, action.stay) };
		case "prevStep":
			return {
				...state,
				step: getCheckOutPreviousStep(state, action.stay),
			};
		case "reset":
			return createInitialCheckOutState();
		default:
			return state;
	}
};
