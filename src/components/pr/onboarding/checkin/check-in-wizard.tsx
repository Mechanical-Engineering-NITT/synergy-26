import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useReducer } from "react";
import { createStay, updateStay } from "@/server/admin/pr/mutation";
import {
	calculateAccommodationTotal,
	getCheckInPricingPreview,
} from "@/server/admin/pr/query";
import type { CheckInMode, StayFullDetails } from "../types";
import {
	checkInReducer,
	createInitialCheckInState,
	isCheckInRoomAllotmentValid,
} from "./check-in-reducer";
import {
	Step1Accommodation,
	Step2Nights,
	Step3Payment,
	Step4Deposit,
	Step5Room,
	Step6Review,
	Step7Confirm,
} from "./check-in-steps";

export function CheckInWizard({
	userId,
	stay,
	mode,
	disabled,
	onComplete,
}: {
	userId: string;
	stay: StayFullDetails;
	mode: CheckInMode;
	disabled: boolean;
	onComplete: () => Promise<void>;
}) {
	const [state, dispatch] = useReducer(
		checkInReducer,
		createInitialCheckInState(),
	);
	const idBase = useId();
	const hostelInputId = `${idBase}-review-hostel`;
	const floorInputId = `${idBase}-review-floor`;
	const isCalculatingPreview =
		state.step === 2 &&
		state.accommodationRequired === true &&
		state.nightsRequested > 0;

	const createStayMutation = useMutation({
		mutationFn: async () =>
			createStay({
				data: {
					userId,
					accommodationRequired: state.accommodationRequired === true,
					nightsRequested:
						state.accommodationRequired === true ? state.nightsRequested : 0,
					hostelName: state.hostelName,
					floor: state.floor,
					paymentVerified:
						state.accommodationRequired === true
							? state.paymentVerified && state.depositVerified
							: true,
				},
			}),
	});

	const updateStayMutation = useMutation({
		mutationFn: async () =>
			updateStay({
				data: {
					userId,
					accommodationRequired: state.accommodationRequired === true,
					nightsRequested:
						state.accommodationRequired === true ? state.nightsRequested : 0,
					hostelName: state.hostelName,
					floor: state.floor,
					paymentVerified: state.paymentVerified,
				},
			}),
	});

	const handleFinalSubmit = async () => {
		try {
			if (mode === "edit") {
				await updateStayMutation.mutateAsync();
			} else {
				await createStayMutation.mutateAsync();
			}

			await onComplete();
			dispatch({ type: "reset" });
		} catch {}
	};

	useEffect(() => {
		if (!stay.exists) {
			dispatch({ type: "reset" });
			return;
		}

		dispatch({
			type: "INITIALIZE_FROM_STAY",
			payload: stay,
		});
	}, [stay]);

	const calculateTotalMutation = useMutation({
		mutationFn: async (nightsRequested: number) =>
			calculateAccommodationTotal({
				data: { nightsRequested },
			}),
	});

	const { data: pricingPreview } = useQuery({
		queryKey: ["pr", "onboarding", "checkin-deposit-preview"],
		queryFn: () =>
			getCheckInPricingPreview({
				data: {
					accommodationRequired: true,
					nightsRequested: 1,
				},
			}),
		enabled: state.accommodationRequired === true,
	});

	const depositAmount =
		state.accommodationRequired === true
			? (pricingPreview?.depositAmount ?? 0)
			: 0;
	const previewTotal =
		state.accommodationRequired === true ? state.accommodationPreviewTotal : 0;
	const totalPayable = previewTotal + depositAmount;
	const isFeeUnchanged =
		mode === "edit" &&
		stay.accommodationRequired &&
		state.accommodationRequired === true &&
		state.nightsRequested === state.originalNightsRequested;
	const isDepositAlreadyPaid =
		mode === "edit" && stay.accommodationRequired && stay.cautionDeposit > 0;

	const isRoomAllotmentValid = isCheckInRoomAllotmentValid(state);

	const isStepValid = () => {
		if (state.accommodationRequired === false) {
			return true;
		}

		if (state.accommodationRequired !== true) {
			return false;
		}

		return (
			state.nightsRequested > 0 &&
			state.paymentVerified === true &&
			(isDepositAlreadyPaid || state.depositVerified === true) &&
			state.roomPrice > 0 &&
			state.accommodationPreviewTotal > 0 &&
			isRoomAllotmentValid
		);
	};

	const canProceedFromCurrentStep =
		state.step === 1
			? state.accommodationRequired !== null
			: state.step === 2 && state.accommodationRequired
				? state.nightsRequested > 0
				: state.step === 3
					? mode === "edit" && isFeeUnchanged
						? true
						: state.paymentVerified
					: state.step === 4
						? isDepositAlreadyPaid
							? true
							: state.depositVerified
						: state.step === 5
							? state.accommodationRequired === true
								? isRoomAllotmentValid
								: true
							: true;

	const isBackDisabled =
		disabled ||
		state.step === 1 ||
		createStayMutation.isPending ||
		updateStayMutation.isPending;
	const isNextDisabled =
		disabled ||
		!canProceedFromCurrentStep ||
		createStayMutation.isPending ||
		updateStayMutation.isPending ||
		calculateTotalMutation.isPending;
	const isFinalSubmitDisabled =
		disabled ||
		createStayMutation.isPending ||
		updateStayMutation.isPending ||
		(state.accommodationRequired === true && !isStepValid());

	const totalFlowSteps = state.accommodationRequired === false ? 3 : 7;
	const currentFlowStep =
		state.accommodationRequired === false
			? state.step === 1
				? 1
				: state.step === 6
					? 2
					: 3
			: state.step;

	const handleNext = async () => {
		if (
			state.step === 2 &&
			state.accommodationRequired === true &&
			(mode !== "edit" || !isFeeUnchanged)
		) {
			const pricingResult = await calculateTotalMutation.mutateAsync(
				state.nightsRequested,
			);

			dispatch({
				type: "setPricingPreview",
				roomPrice: pricingResult.roomPrice,
				accommodationPreviewTotal: pricingResult.total,
				remainingToPay: Math.max(
					0,
					pricingResult.total - state.originalAccommodationFee,
				),
			});
		}

		dispatch({ type: "nextStep" });
	};

	const handleNightsRequestedChange = async (value: number) => {
		dispatch({ type: "setNightsRequested", value });

		if (mode !== "edit") {
			dispatch({ type: "setPaymentVerified", value: false });
			return;
		}

		if (value !== state.originalNightsRequested) {
			dispatch({ type: "setPaymentVerified", value: false });

			if (value > 0 && state.accommodationRequired === true) {
				const pricingResult = await calculateTotalMutation.mutateAsync(value);

				dispatch({
					type: "setPricingPreview",
					roomPrice: pricingResult.roomPrice,
					accommodationPreviewTotal: pricingResult.total,
					remainingToPay: Math.max(
						0,
						pricingResult.total - state.originalAccommodationFee,
					),
				});
			}
			return;
		}

		dispatch({ type: "setPaymentVerified", value: true });
		dispatch({
			type: "setPricingPreview",
			roomPrice:
				state.originalNightsRequested > 0
					? Math.floor(
							state.originalAccommodationFee / state.originalNightsRequested,
						)
					: 0,
			accommodationPreviewTotal: state.originalAccommodationFee,
			remainingToPay: 0,
		});
	};

	return (
		<div className="rounded-md border border-[#222222] bg-[#141414] p-4 text-[#fafafa] transition-all duration-200">
			<p className="mt-2 text-xs text-[#71717a]">
				Step {currentFlowStep} of {totalFlowSteps}
			</p>

			<div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1 text-sm">
				{state.step === 1 ? (
					<Step1Accommodation
						state={state}
						dispatch={dispatch}
						staySnapshot={stay}
						disabled={disabled}
						mode={mode}
						createPending={createStayMutation.isPending}
						updatePending={updateStayMutation.isPending}
					/>
				) : null}

				{state.step === 2 ? (
					<Step2Nights
						state={state}
						disabled={disabled}
						createPending={createStayMutation.isPending}
						updatePending={updateStayMutation.isPending}
						onNightsChange={(value) => {
							void handleNightsRequestedChange(value);
						}}
					/>
				) : null}

				{state.step === 3 ? (
					<Step3Payment
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						mode={mode}
						createPending={createStayMutation.isPending}
						updatePending={updateStayMutation.isPending}
						isFeeUnchanged={isFeeUnchanged}
						previewTotal={previewTotal}
					/>
				) : null}

				{state.step === 4 ? (
					<Step4Deposit
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						mode={mode}
						createPending={createStayMutation.isPending}
						updatePending={updateStayMutation.isPending}
						depositAmount={depositAmount}
						isDepositAlreadyPaid={isDepositAlreadyPaid}
						originalDepositAmount={stay.cautionDeposit}
					/>
				) : null}

				{state.step === 5 ? (
					<Step5Room
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						mode={mode}
						createPending={createStayMutation.isPending}
						updatePending={updateStayMutation.isPending}
						hostelInputId={hostelInputId}
						floorInputId={floorInputId}
					/>
				) : null}

				{state.step === 6 ? (
					<Step6Review
						state={state}
						previewTotal={previewTotal}
						depositAmount={depositAmount}
						totalPayable={totalPayable}
					/>
				) : null}

				{state.step === 7 ? (
					<Step7Confirm
						state={state}
						previewTotal={previewTotal}
						depositAmount={depositAmount}
					/>
				) : null}
			</div>

			{calculateTotalMutation.isError ? (
				<p className="mt-3 border-l-[3px] border-l-[#ef4444] pl-2 text-xs text-[#ef4444]">
					{calculateTotalMutation.error instanceof Error
						? calculateTotalMutation.error.message
						: "Failed to calculate accommodation total."}
				</p>
			) : null}

			{createStayMutation.isError ? (
				<p className="mt-3 border-l-[3px] border-l-[#ef4444] pl-2 text-xs text-[#ef4444]">
					{createStayMutation.error instanceof Error
						? createStayMutation.error.message
						: "Failed to create stay."}
				</p>
			) : null}

			{updateStayMutation.isError ? (
				<p className="mt-3 border-l-[3px] border-l-[#ef4444] pl-2 text-xs text-[#ef4444]">
					{updateStayMutation.error instanceof Error
						? updateStayMutation.error.message
						: "Failed to update stay."}
				</p>
			) : null}

			<div className="mt-4 flex items-center gap-2">
				{state.step < 7 ? (
					<>
						<button
							type="button"
							onClick={() => dispatch({ type: "prevStep" })}
							disabled={isBackDisabled}
							className={`rounded-[10px] border border-[#2a2a2a] px-4 py-2 text-sm transition-all duration-200 disabled:cursor-not-allowed ${
								isBackDisabled
									? "bg-[#141414] text-[#71717a]"
									: "bg-transparent text-[#fafafa]"
							}`}
						>
							Back
						</button>

						<button
							type="button"
							onClick={() => {
								void handleNext();
							}}
							disabled={isNextDisabled}
							className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-opacity duration-200 disabled:cursor-not-allowed ${
								isNextDisabled
									? "border border-[#2a2a2a] bg-[#141414] text-[#71717a]"
									: "border border-white bg-white text-black"
							}`}
						>
							{isCalculatingPreview && calculateTotalMutation.isPending
								? "Calculating..."
								: "Next"}
						</button>
					</>
				) : (
					<div className="mx-auto w-full max-w-md space-y-3">
						<button
							type="button"
							onClick={() => {
								void handleFinalSubmit();
							}}
							disabled={isFinalSubmitDisabled}
							className={`w-full rounded-[10px] px-4 py-2 text-base font-semibold transition-opacity duration-200 disabled:cursor-not-allowed ${
								isFinalSubmitDisabled
									? "border border-[#2a2a2a] bg-[#141414] text-[#71717a]"
									: "border border-white bg-white text-black"
							}`}
						>
							{createStayMutation.isPending || updateStayMutation.isPending
								? "Saving..."
								: mode === "edit"
									? "Save Check-In Changes"
									: "Confirm Check-In"}
						</button>

						<button
							type="button"
							onClick={() => dispatch({ type: "prevStep" })}
							disabled={
								disabled ||
								createStayMutation.isPending ||
								updateStayMutation.isPending
							}
							className={`w-full rounded-[10px] border border-[#2a2a2a] px-4 py-2 text-sm transition-all duration-200 disabled:cursor-not-allowed ${
								disabled ||
								createStayMutation.isPending ||
								updateStayMutation.isPending
									? "bg-[#141414] text-[#71717a]"
									: "bg-transparent text-[#a1a1aa]"
							}`}
						>
							Back
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
