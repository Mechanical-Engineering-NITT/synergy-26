import type { CheckOutAction, CheckOutState, WizardStep } from "../types";

export const createInitialCheckOutState = (): CheckOutState => ({
	step: 1,
	fineApplicable: null,
	fineAmount: 0,
	finePaid: false,
	cautionReturned: false,
});

export const getCheckOutNextStep = (
	currentStep: WizardStep,
	currentState: CheckOutState,
) => {
	if (currentStep === 2 && currentState.fineApplicable === false) {
		return 5 as WizardStep;
	}

	if (currentStep === 4 && currentState.fineApplicable === true) {
		return 6 as WizardStep;
	}

	const defaultFlow: Record<1 | 2 | 3 | 4 | 5 | 6, WizardStep> = {
		1: 2,
		2: 3,
		3: 4,
		4: 5,
		5: 6,
		6: 7,
	};

	return defaultFlow[currentStep as 1 | 2 | 3 | 4 | 5 | 6] ?? 7;
};

export const getCheckOutPreviousStep = (
	currentStep: WizardStep,
	currentState: CheckOutState,
) => {
	if (currentStep === 5 && currentState.fineApplicable === false) {
		return 2 as WizardStep;
	}

	if (currentStep === 6 && currentState.fineApplicable === true) {
		return 4 as WizardStep;
	}

	const defaultBack: Record<2 | 3 | 4 | 5 | 6 | 7, WizardStep> = {
		2: 1,
		3: 2,
		4: 3,
		5: 4,
		6: 5,
		7: 6,
	};

	return defaultBack[currentStep as 2 | 3 | 4 | 5 | 6 | 7] ?? 1;
};

export const isCheckOutFinalStateValid = ({
	checkedInAt,
	checkedOutAt,
	state,
}: {
	checkedInAt: Date | null;
	checkedOutAt: Date | null;
	state: CheckOutState;
}) =>
	Boolean(checkedInAt) &&
	!checkedOutAt &&
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
		case "nextStep":
			return { ...state, step: getCheckOutNextStep(state.step, state) };
		case "prevStep":
			return { ...state, step: getCheckOutPreviousStep(state.step, state) };
		case "reset":
			return createInitialCheckOutState();
		default:
			return state;
	}
};
