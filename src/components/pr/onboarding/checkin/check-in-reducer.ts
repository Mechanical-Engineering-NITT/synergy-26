import type {
	CheckInAction,
	CheckInState,
	StayFullDetails,
	WizardStep,
} from "../types";

export const createInitialCheckInState = (): CheckInState => ({
	step: 1,
	accommodationRequired: null,
	nightsRequested: 0,
	originalNightsRequested: 0,
	originalAccommodationFee: 0,
	paymentVerified: false,
	depositVerified: false,
	hostelName: null,
	floor: null,
	roomPrice: 0,
	accommodationPreviewTotal: 0,
	remainingToPay: 0,
});

const calculateRoomPrice = (
	nightsRequested: number,
	accommodationFee: number,
) => (nightsRequested > 0 ? Math.floor(accommodationFee / nightsRequested) : 0);

export const buildInitialStateFromStay = (
	stay: StayFullDetails,
): CheckInState => {
	const hasAccommodation = stay.accommodationRequired;
	const nightsRequested = hasAccommodation ? stay.nightsRequested : 0;
	const accommodationFee = hasAccommodation ? stay.accommodationFee : 0;
	const roomPrice = calculateRoomPrice(nightsRequested, accommodationFee);

	return {
		step: 1,
		accommodationRequired: hasAccommodation,
		nightsRequested,
		originalNightsRequested: nightsRequested,
		originalAccommodationFee: accommodationFee,
		paymentVerified: hasAccommodation ? stay.paymentVerified : false,
		depositVerified: hasAccommodation ? stay.cautionDeposit > 0 : false,
		hostelName: hasAccommodation ? stay.hostelName : null,
		floor: hasAccommodation ? stay.floor : null,
		roomPrice,
		accommodationPreviewTotal: accommodationFee,
		remainingToPay: 0,
	};
};

export const getCheckInNextStep = (
	currentStep: WizardStep,
	currentState: CheckInState,
) => {
	if (currentState.accommodationRequired === false) {
		const noAccommodationFlow: Partial<Record<WizardStep, WizardStep>> = {
			1: 6,
			6: 7,
		};

		return noAccommodationFlow[currentStep] ?? 7;
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

export const getCheckInPreviousStep = (
	currentStep: WizardStep,
	currentState: CheckInState,
) => {
	if (currentState.accommodationRequired === false) {
		const noAccommodationBack: Partial<Record<WizardStep, WizardStep>> = {
			7: 6,
			6: 1,
		};

		return noAccommodationBack[currentStep] ?? 1;
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

export const isCheckInRoomAllotmentValid = (state: CheckInState) =>
	Boolean(state.hostelName?.trim()) && Boolean(state.floor?.trim());

export const checkInReducer = (
	state: CheckInState,
	action: CheckInAction,
): CheckInState => {
	switch (action.type) {
		case "INITIALIZE_FROM_STAY":
			return buildInitialStateFromStay(action.payload);
		case "setAccommodationRequired":
			if (action.value === false) {
				return {
					...state,
					accommodationRequired: false,
					nightsRequested: 0,
					originalNightsRequested: 0,
					originalAccommodationFee: 0,
					hostelName: null,
					floor: null,
					paymentVerified: false,
					depositVerified: false,
					roomPrice: 0,
					accommodationPreviewTotal: 0,
					remainingToPay: 0,
				};
			}

			if (action.value === true) {
				const stayFromDb = action.staySnapshot;
				const hasAccommodationInDb = stayFromDb.accommodationRequired;
				const restoredNightsRequested = hasAccommodationInDb
					? stayFromDb.nightsRequested
					: 0;
				const restoredAccommodationFee = hasAccommodationInDb
					? stayFromDb.accommodationFee
					: 0;

				return {
					...state,
					accommodationRequired: true,
					nightsRequested: restoredNightsRequested,
					originalNightsRequested: restoredNightsRequested,
					originalAccommodationFee: restoredAccommodationFee,
					hostelName: hasAccommodationInDb ? stayFromDb.hostelName : null,
					floor: hasAccommodationInDb ? stayFromDb.floor : null,
					paymentVerified: hasAccommodationInDb
						? stayFromDb.paymentVerified
						: false,
					depositVerified: hasAccommodationInDb
						? stayFromDb.cautionDeposit > 0
						: false,
					roomPrice: calculateRoomPrice(
						restoredNightsRequested,
						restoredAccommodationFee,
					),
					accommodationPreviewTotal: restoredAccommodationFee,
					remainingToPay: 0,
				};
			}

			return {
				...state,
				step: 1,
				accommodationRequired: null,
				nightsRequested: 0,
				originalNightsRequested: 0,
				originalAccommodationFee: 0,
				hostelName: null,
				floor: null,
				paymentVerified: false,
				depositVerified: false,
				roomPrice: 0,
				accommodationPreviewTotal: 0,
				remainingToPay: 0,
			};
		case "setNightsRequested":
			return {
				...state,
				nightsRequested: action.value,
				roomPrice: 0,
				accommodationPreviewTotal: 0,
				remainingToPay: 0,
			};
		case "setPaymentVerified":
			return { ...state, paymentVerified: action.value };
		case "setDepositVerified":
			return { ...state, depositVerified: action.value };
		case "setHostelName":
			return { ...state, hostelName: action.value };
		case "setFloor":
			return { ...state, floor: action.value };
		case "hydrateFromEdit":
			return {
				...state,
				step: 1,
				accommodationRequired: action.value.accommodationRequired,
				nightsRequested: action.value.nightsRequested,
				originalNightsRequested: action.value.originalNightsRequested,
				originalAccommodationFee: action.value.originalAccommodationFee,
				paymentVerified: action.value.paymentVerified,
				depositVerified: true,
				hostelName: action.value.hostelName,
				floor: action.value.floor,
				roomPrice:
					action.value.nightsRequested > 0
						? Math.floor(
								action.value.accommodationPreviewTotal /
									action.value.nightsRequested,
							)
						: 0,
				accommodationPreviewTotal: action.value.accommodationPreviewTotal,
				remainingToPay: 0,
			};
		case "setPricingPreview":
			return {
				...state,
				roomPrice: action.roomPrice,
				accommodationPreviewTotal: action.accommodationPreviewTotal,
				remainingToPay: action.remainingToPay,
			};
		case "nextStep":
			return { ...state, step: getCheckInNextStep(state.step, state) };
		case "prevStep":
			return { ...state, step: getCheckInPreviousStep(state.step, state) };
		case "reset":
			return createInitialCheckInState();
		default:
			return state;
	}
};
