type EventOption = {
	id: number;
	title: string;
	isDisabled: boolean;
};

export type OnspotRegistrationStep = 1 | 2 | 3 | 4;

export type OnspotRegistrationState = {
	selectedWorkshops: number[];
	selectedEventIds: number[];
	eventPassSelected: boolean;
	eventPassAlreadyOwned: boolean;
	events: EventOption[];
	existingEventRegistrations: number[];
	initialSelectedWorkshops: number[];
	initialSelectedEventIds: number[];
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
	| {
			type: "SELECT_EVENT";
			eventId: number;
			disabledEventIds: number[];
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
	selectedEventIds,
	eventPassSelected,
	initialSelectedWorkshops,
	initialSelectedEventIds,
	initialEventPassSelected,
}: {
	selectedWorkshops: number[];
	selectedEventIds: number[];
	eventPassSelected: boolean;
	initialSelectedWorkshops: number[];
	initialSelectedEventIds: number[];
	initialEventPassSelected: boolean;
}) => {
	return (
		!areNumberArraysEqual(selectedWorkshops, initialSelectedWorkshops) ||
		!areNumberArraysEqual(selectedEventIds, initialSelectedEventIds) ||
		eventPassSelected !== initialEventPassSelected
	);
};

export const createInitialOnspotRegistrationState = ({
	existingWorkshopRegistrations = [],
	existingEventRegistrations = [],
	events = [],
	initialSelectedWorkshops = [],
	initialSelectedEventIds = [],
	initialEventPassSelected = false,
	eventPassAlreadyOwned = false,
}: {
	existingWorkshopRegistrations?: number[];
	existingEventRegistrations?: number[];
	events?: EventOption[];
	initialSelectedWorkshops?: number[];
	initialSelectedEventIds?: number[];
	initialEventPassSelected?: boolean;
	eventPassAlreadyOwned?: boolean;
}): OnspotRegistrationState => {
	const hasExistingWorkshopRegistrations =
		existingWorkshopRegistrations.length > 0;
	const normalizedInitialSelectedWorkshops = Array.from(
		new Set(initialSelectedWorkshops),
	);
	const normalizedInitialEventPassSelected = hasExistingWorkshopRegistrations
		? false
		: initialEventPassSelected;
	const normalizedInitialSelectedEventIds = Array.from(
		new Set(initialSelectedEventIds),
	).filter(
		(eventId) =>
			!existingEventRegistrations.includes(eventId) &&
			events.some((eventEntry) => eventEntry.id === eventId),
	);

	return {
		selectedWorkshops: normalizedInitialSelectedWorkshops,
		selectedEventIds: normalizedInitialSelectedEventIds,
		eventPassSelected: normalizedInitialEventPassSelected,
		eventPassAlreadyOwned,
		events,
		existingEventRegistrations,
		initialSelectedWorkshops: normalizedInitialSelectedWorkshops,
		initialSelectedEventIds: normalizedInitialSelectedEventIds,
		initialEventPassSelected: normalizedInitialEventPassSelected,
		hasExistingWorkshopRegistrations,
		hasChanges: false,
		calculatedAmount: 0,
		paymentVerified: false,
		currentStep: 1,
	};
};

const MAX_STEP: OnspotRegistrationStep = 4;
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
			const showEventSection =
				eventPassSelected ||
				state.eventPassAlreadyOwned ||
				selectedWorkshops.length > 0;
			const selectedEventIds = showEventSection ? state.selectedEventIds : [];

			return {
				...state,
				selectedWorkshops,
				selectedEventIds,
				eventPassSelected,
				hasChanges: computeHasChanges({
					selectedWorkshops,
					selectedEventIds,
					eventPassSelected,
					initialSelectedWorkshops: state.initialSelectedWorkshops,
					initialSelectedEventIds: state.initialSelectedEventIds,
					initialEventPassSelected: state.initialEventPassSelected,
				}),
				calculatedAmount: 0,
				paymentVerified: false,
			};
		}

		case "SELECT_EVENT": {
			if (action.disabledEventIds.includes(action.eventId)) {
				return state;
			}

			const showEventSection =
				state.eventPassSelected ||
				state.eventPassAlreadyOwned ||
				state.selectedWorkshops.length > 0;

			if (!showEventSection) {
				return state;
			}

			const eventAlreadySelected = state.selectedEventIds.includes(
				action.eventId,
			);
			const selectedEventIds = eventAlreadySelected
				? state.selectedEventIds.filter((eventId) => eventId !== action.eventId)
				: [...state.selectedEventIds, action.eventId];

			return {
				...state,
				selectedEventIds,
				hasChanges: computeHasChanges({
					selectedWorkshops: state.selectedWorkshops,
					selectedEventIds,
					eventPassSelected: state.eventPassSelected,
					initialSelectedWorkshops: state.initialSelectedWorkshops,
					initialSelectedEventIds: state.initialSelectedEventIds,
					initialEventPassSelected: state.initialEventPassSelected,
				}),
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
			const showEventSection =
				eventPassSelected ||
				state.eventPassAlreadyOwned ||
				state.selectedWorkshops.length > 0;
			const selectedEventIds = showEventSection ? state.selectedEventIds : [];

			return {
				...state,
				selectedEventIds,
				eventPassSelected,
				hasChanges: computeHasChanges({
					selectedWorkshops: state.selectedWorkshops,
					selectedEventIds,
					eventPassSelected,
					initialSelectedWorkshops: state.initialSelectedWorkshops,
					initialSelectedEventIds: state.initialSelectedEventIds,
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
