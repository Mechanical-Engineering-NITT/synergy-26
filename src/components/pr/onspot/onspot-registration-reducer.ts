export type OnspotRegistrationStep = 1 | 2 | 3;

export type OnspotRegistrationState = {
	selectedWorkshops: number[];
	eventPassSelected: boolean;
	initialSelectedWorkshops: number[];
	initialEventPassSelected: boolean;
	hasExistingWorkshopRegistrations: boolean;
	hasChanges: boolean;
	calculatedAmount: number;
	paymentVerified: boolean;
	currentStep: OnspotRegistrationStep;
};

export type OnspotRegistrationAction =
	| {
			type: "SELECT_WORKSHOP";
			workshopId: number;
			disabledWorkshopIds: number[];
	  }
	| { type: "TOGGLE_EVENT_PASS"; value: boolean }
	| { type: "SET_AMOUNT"; calculatedAmount: number }
	| { type: "VERIFY_PAYMENT"; value: boolean }
	| { type: "NEXT_STEP" }
	| { type: "PREVIOUS_STEP" };

const areNumberArraysEqual = (firstArray: number[], secondArray: number[]) => {
	if (firstArray.length !== secondArray.length) {
		return false;
	}

	const sortedFirstArray = [...firstArray].sort(
		(leftValue, rightValue) => leftValue - rightValue,
	);
	const sortedSecondArray = [...secondArray].sort(
		(leftValue, rightValue) => leftValue - rightValue,
	);

	return sortedFirstArray.every(
		(value, index) => value === sortedSecondArray[index],
	);
};

const computeHasChanges = ({
	selectedWorkshops,
	eventPassSelected,
	initialSelectedWorkshops,
	initialEventPassSelected,
}: {
	selectedWorkshops: number[];
	eventPassSelected: boolean;
	initialSelectedWorkshops: number[];
	initialEventPassSelected: boolean;
}) => {
	return (
		!areNumberArraysEqual(selectedWorkshops, initialSelectedWorkshops) ||
		eventPassSelected !== initialEventPassSelected
	);
};

export const createInitialOnspotRegistrationState = ({
	existingWorkshopRegistrations = [],
	initialSelectedWorkshops = [],
	initialEventPassSelected = false,
}: {
	existingWorkshopRegistrations?: number[];
	initialSelectedWorkshops?: number[];
	initialEventPassSelected?: boolean;
}): OnspotRegistrationState => {
	const hasExistingWorkshopRegistrations =
		existingWorkshopRegistrations.length > 0;
	const normalizedInitialSelectedWorkshops = Array.from(
		new Set(initialSelectedWorkshops),
	);
	const normalizedInitialEventPassSelected = hasExistingWorkshopRegistrations
		? false
		: initialEventPassSelected;

	return {
		selectedWorkshops: normalizedInitialSelectedWorkshops,
		eventPassSelected: normalizedInitialEventPassSelected,
		initialSelectedWorkshops: normalizedInitialSelectedWorkshops,
		initialEventPassSelected: normalizedInitialEventPassSelected,
		hasExistingWorkshopRegistrations,
		hasChanges: false,
		calculatedAmount: 0,
		paymentVerified: false,
		currentStep: 1,
	};
};

const MAX_STEP: OnspotRegistrationStep = 3;
const MIN_STEP: OnspotRegistrationStep = 1;

export const onspotRegistrationReducer = (
	state: OnspotRegistrationState,
	action: OnspotRegistrationAction,
): OnspotRegistrationState => {
	switch (action.type) {
		case "SELECT_WORKSHOP": {
			if (action.disabledWorkshopIds.includes(action.workshopId)) {
				return state;
			}

			const workshopAlreadySelected = state.selectedWorkshops.includes(
				action.workshopId,
			);
			const selectedWorkshops = workshopAlreadySelected
				? state.selectedWorkshops.filter(
						(workshopId) => workshopId !== action.workshopId,
					)
				: [...state.selectedWorkshops, action.workshopId];
			const eventPassSelected =
				selectedWorkshops.length > 0 ? false : state.eventPassSelected;

			return {
				...state,
				selectedWorkshops,
				eventPassSelected,
				hasChanges: computeHasChanges({
					selectedWorkshops,
					eventPassSelected,
					initialSelectedWorkshops: state.initialSelectedWorkshops,
					initialEventPassSelected: state.initialEventPassSelected,
				}),
				calculatedAmount: 0,
				paymentVerified: false,
			};
		}

		case "TOGGLE_EVENT_PASS": {
			if (
				state.hasExistingWorkshopRegistrations ||
				state.selectedWorkshops.length > 0
			) {
				return {
					...state,
					eventPassSelected: false,
				};
			}

			const eventPassSelected = action.value;

			return {
				...state,
				eventPassSelected,
				hasChanges: computeHasChanges({
					selectedWorkshops: state.selectedWorkshops,
					eventPassSelected,
					initialSelectedWorkshops: state.initialSelectedWorkshops,
					initialEventPassSelected: state.initialEventPassSelected,
				}),
				calculatedAmount: 0,
				paymentVerified: false,
			};
		}

		case "SET_AMOUNT":
			return {
				...state,
				calculatedAmount: action.calculatedAmount,
			};

		case "VERIFY_PAYMENT":
			return {
				...state,
				paymentVerified: action.value,
			};

		case "NEXT_STEP":
			return {
				...state,
				currentStep: Math.min(
					MAX_STEP,
					state.currentStep + 1,
				) as OnspotRegistrationStep,
			};

		case "PREVIOUS_STEP":
			return {
				...state,
				currentStep: Math.max(
					MIN_STEP,
					state.currentStep - 1,
				) as OnspotRegistrationStep,
			};

		default:
			return state;
	}
};
