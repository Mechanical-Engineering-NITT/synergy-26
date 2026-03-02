import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useReducer } from "react";
import { calculateAccommodationTotal } from "@/server/admin/admin.pr.calculateAccommodationTotal";
import { createStay } from "@/server/admin/admin.pr.createStay";
import { getCheckInPricingPreview } from "@/server/admin/admin.pr.pricing";
import { updateStay } from "@/server/admin/admin.pr.updateStay";
import type { CheckInMode, StayFullDetails } from "../types";
import {
	checkInReducer,
	createInitialCheckInState,
	isCheckInRoomAllotmentValid,
} from "./checkInReducer";
import {
	Step1Accommodation,
	Step2Nights,
	Step3Payment,
	Step4Deposit,
	Step5Room,
	Step6Review,
	Step7Confirm,
} from "./checkInSteps";

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
	const normalizeNullableText = (value: string | null) => value?.trim() || null;
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
					hostelName: normalizeNullableText(state.hostelName),
					floor: normalizeNullableText(state.floor),
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
					nightsRequested:
						state.accommodationRequired === true ? state.nightsRequested : 0,
					hostelName: normalizeNullableText(state.hostelName),
					floor: normalizeNullableText(state.floor),
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
			payload: {
				accommodationRequired: stay.accommodationRequired,
				nightsRequested: stay.nightsRequested,
				accommodationFee: stay.accommodationFee,
				paymentVerified: stay.paymentVerified,
				hostelName: stay.hostelName,
				floor: stay.floor,
			},
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

	const depositAmount = pricingPreview?.depositAmount ?? 0;
	const previewTotal =
		state.accommodationRequired === true ? state.accommodationPreviewTotal : 0;
	const totalPayable = previewTotal + depositAmount;
	const isFeeUnchanged =
		mode === "edit" && state.nightsRequested === state.originalNightsRequested;

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
			(mode === "edit" || state.depositVerified === true) &&
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
						? mode === "edit"
							? true
							: state.depositVerified
						: state.step === 5
							? state.accommodationRequired === true
								? isRoomAllotmentValid
								: true
							: true;

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
		<div
			className="rounded-md p-4"
			style={{
				backgroundColor: "#141414",
				color: "#fafafa",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p style={{ fontSize: "12px", color: "#71717a", marginTop: "8px" }}>
				Step {currentFlowStep} of {totalFlowSteps}
			</p>

			<div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1 text-sm">
				{state.step === 1 ? (
					<Step1Accommodation
						state={state}
						dispatch={dispatch}
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
				<p
					style={{
						marginTop: "12px",
						fontSize: "12px",
						color: "#ef4444",
						borderLeft: "3px solid #ef4444",
						paddingLeft: "8px",
					}}
				>
					{calculateTotalMutation.error instanceof Error
						? calculateTotalMutation.error.message
						: "Failed to calculate accommodation total."}
				</p>
			) : null}

			{createStayMutation.isError ? (
				<p
					style={{
						marginTop: "12px",
						fontSize: "12px",
						color: "#ef4444",
						borderLeft: "3px solid #ef4444",
						paddingLeft: "8px",
					}}
				>
					{createStayMutation.error instanceof Error
						? createStayMutation.error.message
						: "Failed to create stay."}
				</p>
			) : null}

			{updateStayMutation.isError ? (
				<p
					style={{
						marginTop: "12px",
						fontSize: "12px",
						color: "#ef4444",
						borderLeft: "3px solid #ef4444",
						paddingLeft: "8px",
					}}
				>
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
							disabled={
								disabled ||
								state.step === 1 ||
								createStayMutation.isPending ||
								updateStayMutation.isPending
							}
							className="text-sm disabled:cursor-not-allowed"
							style={{
								backgroundColor:
									disabled ||
									state.step === 1 ||
									createStayMutation.isPending ||
									updateStayMutation.isPending
										? "#141414"
										: "transparent",
								color:
									disabled ||
									state.step === 1 ||
									createStayMutation.isPending ||
									updateStayMutation.isPending
										? "#71717a"
										: "#fafafa",
								borderRadius: "10px",
								padding: "8px 16px",
								border: "1px solid #2a2a2a",
								transition: "all 0.2s ease",
							}}
						>
							Back
						</button>

						<button
							type="button"
							onClick={() => {
								void handleNext();
							}}
							disabled={
								disabled ||
								!canProceedFromCurrentStep ||
								createStayMutation.isPending ||
								updateStayMutation.isPending ||
								calculateTotalMutation.isPending
							}
							className="text-sm disabled:cursor-not-allowed"
							style={{
								backgroundColor:
									disabled ||
									!canProceedFromCurrentStep ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									calculateTotalMutation.isPending
										? "#141414"
										: "#ffffff",
								color:
									disabled ||
									!canProceedFromCurrentStep ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									calculateTotalMutation.isPending
										? "#71717a"
										: "#000000",
								borderRadius: "10px",
								padding: "8px 16px",
								fontWeight: 500,
								border:
									disabled ||
									!canProceedFromCurrentStep ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									calculateTotalMutation.isPending
										? "1px solid #2a2a2a"
										: "1px solid #ffffff",
								transition: "opacity 0.2s ease",
							}}
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
							disabled={
								disabled ||
								createStayMutation.isPending ||
								updateStayMutation.isPending ||
								(state.accommodationRequired === true && !isStepValid())
							}
							className="w-full text-base font-semibold disabled:cursor-not-allowed"
							style={{
								backgroundColor:
									disabled ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									(state.accommodationRequired === true && !isStepValid())
										? "#141414"
										: "#ffffff",
								color:
									disabled ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									(state.accommodationRequired === true && !isStepValid())
										? "#71717a"
										: "#000000",
								borderRadius: "10px",
								padding: "8px 16px",
								border:
									disabled ||
									createStayMutation.isPending ||
									updateStayMutation.isPending ||
									(state.accommodationRequired === true && !isStepValid())
										? "1px solid #2a2a2a"
										: "1px solid #ffffff",
								transition: "opacity 0.2s ease",
							}}
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
							className="w-full text-sm disabled:cursor-not-allowed"
							style={{
								backgroundColor:
									disabled ||
									createStayMutation.isPending ||
									updateStayMutation.isPending
										? "#141414"
										: "transparent",
								color:
									disabled ||
									createStayMutation.isPending ||
									updateStayMutation.isPending
										? "#71717a"
										: "#a1a1aa",
								borderRadius: "10px",
								padding: "8px 16px",
								border: "1px solid #2a2a2a",
								transition: "all 0.2s ease",
							}}
						>
							Back
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
