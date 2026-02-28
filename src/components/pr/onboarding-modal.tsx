import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useReducer, useState } from "react";
import { calculateAccommodationTotal } from "@/server/admin/admin.pr.calculateAccommodationTotal";
import { completeStay } from "@/server/admin/admin.pr.completeStay";
import { createStay } from "@/server/admin/admin.pr.createStay";
import { getStayDetails } from "@/server/admin/admin.pr.getStayDetails";
import { getStayStatus } from "@/server/admin/admin.pr.getStayStatus";
import { getCheckInPricingPreview } from "@/server/admin/admin.pr.pricing";

type StayStatus = {
	exists: boolean;
	checkedInAt: Date | null;
	checkedOutAt: Date | null;
};

type CheckInStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type CheckOutStep = 1 | 2 | 3 | 4 | 5;

type CheckInState = {
	step: CheckInStep;
	accommodationRequired: boolean | null;
	nightsRequested: number;
	paymentVerified: boolean;
	depositVerified: boolean;
	hostelName: string | null;
	floor: string | null;
	roomPrice: number;
	accommodationPreviewTotal: number;
};

type CheckOutState = {
	step: CheckOutStep;
	fineAmount: number;
	finePaid: boolean;
	cautionReturned: boolean;
};

type CheckInAction =
	| { type: "setAccommodationRequired"; value: boolean | null }
	| { type: "setNightsRequested"; value: number }
	| { type: "setPaymentVerified"; value: boolean }
	| { type: "setDepositVerified"; value: boolean }
	| { type: "setHostelName"; value: string | null }
	| { type: "setFloor"; value: string | null }
	| {
			type: "setPricingPreview";
			roomPrice: number;
			accommodationPreviewTotal: number;
	  }
	| { type: "nextStep" }
	| { type: "prevStep" }
	| { type: "reset" };

type CheckOutAction =
	| { type: "setFineAmount"; value: number }
	| { type: "setFinePaid"; value: boolean }
	| { type: "setCautionReturned"; value: boolean }
	| { type: "nextStep" }
	| { type: "prevStep" }
	| { type: "reset" };

const initialCheckInState: CheckInState = {
	step: 1,
	accommodationRequired: null,
	nightsRequested: 0,
	paymentVerified: false,
	depositVerified: false,
	hostelName: null,
	floor: null,
	roomPrice: 0,
	accommodationPreviewTotal: 0,
};

const initialCheckOutState: CheckOutState = {
	step: 1,
	fineAmount: 0,
	finePaid: false,
	cautionReturned: false,
};

function checkInReducer(
	state: CheckInState,
	action: CheckInAction,
): CheckInState {
	const getNextStep = (
		currentStep: CheckInStep,
		currentState: CheckInState,
	) => {
		if (currentState.accommodationRequired === false) {
			const noAccommodationFlow: Partial<Record<CheckInStep, CheckInStep>> = {
				1: 6,
				6: 7,
			};

			return noAccommodationFlow[currentStep] ?? 7;
		}

		const defaultFlow: Record<1 | 2 | 3 | 4 | 5 | 6, CheckInStep> = {
			1: 2,
			2: 3,
			3: 4,
			4: 5,
			5: 6,
			6: 7,
		};

		return defaultFlow[currentStep as 1 | 2 | 3 | 4 | 5 | 6] ?? 7;
	};

	const getPreviousStep = (
		currentStep: CheckInStep,
		currentState: CheckInState,
	) => {
		if (currentState.accommodationRequired === false) {
			const noAccommodationBack: Partial<Record<CheckInStep, CheckInStep>> = {
				7: 6,
				6: 1,
			};

			return noAccommodationBack[currentStep] ?? 1;
		}

		const defaultBack: Record<2 | 3 | 4 | 5 | 6 | 7, CheckInStep> = {
			2: 1,
			3: 2,
			4: 3,
			5: 4,
			6: 5,
			7: 6,
		};

		return defaultBack[currentStep as 2 | 3 | 4 | 5 | 6 | 7] ?? 1;
	};

	switch (action.type) {
		case "setAccommodationRequired":
			if (action.value === false) {
				return {
					...state,
					accommodationRequired: false,
					nightsRequested: 0,
					hostelName: null,
					floor: null,
					paymentVerified: true,
					depositVerified: true,
					roomPrice: 0,
					accommodationPreviewTotal: 0,
				};
			}

			if (action.value === true) {
				return {
					...state,
					accommodationRequired: true,
					nightsRequested: 0,
					hostelName: null,
					floor: null,
					paymentVerified: false,
					depositVerified: false,
					roomPrice: 0,
					accommodationPreviewTotal: 0,
				};
			}

			return {
				...state,
				step: 1,
				accommodationRequired: null,
				nightsRequested: 0,
				hostelName: null,
				floor: null,
				paymentVerified: false,
				depositVerified: false,
				roomPrice: 0,
				accommodationPreviewTotal: 0,
			};
		case "setNightsRequested":
			return {
				...state,
				nightsRequested: action.value,
				roomPrice: 0,
				accommodationPreviewTotal: 0,
			};
		case "setPaymentVerified":
			return { ...state, paymentVerified: action.value };
		case "setDepositVerified":
			return { ...state, depositVerified: action.value };
		case "setHostelName":
			return { ...state, hostelName: action.value };
		case "setFloor":
			return { ...state, floor: action.value };
		case "setPricingPreview":
			return {
				...state,
				roomPrice: action.roomPrice,
				accommodationPreviewTotal: action.accommodationPreviewTotal,
			};
		case "nextStep":
			return { ...state, step: getNextStep(state.step, state) };
		case "prevStep":
			return { ...state, step: getPreviousStep(state.step, state) };
		case "reset":
			return initialCheckInState;
		default:
			return state;
	}
}

function checkOutReducer(
	state: CheckOutState,
	action: CheckOutAction,
): CheckOutState {
	switch (action.type) {
		case "setFineAmount":
			return { ...state, fineAmount: action.value };
		case "setFinePaid":
			return { ...state, finePaid: action.value };
		case "setCautionReturned":
			return { ...state, cautionReturned: action.value };
		case "nextStep":
			return { ...state, step: Math.min(5, state.step + 1) as CheckOutStep };
		case "prevStep":
			return { ...state, step: Math.max(1, state.step - 1) as CheckOutStep };
		case "reset":
			return initialCheckOutState;
		default:
			return state;
	}
}

function StatusPanel({ status }: { status: StayStatus }) {
	const statusLabel = !status.exists
		? "Not Checked In"
		: status.checkedInAt && !status.checkedOutAt
			? "Currently Checked In"
			: status.checkedOutAt
				? "Stay Completed (Locked)"
				: "Not Checked In";

	return (
		<div className="rounded-md border border-border bg-card p-4">
			<h3 className="text-sm font-medium">StatusPanel</h3>
			<p className="mt-2 text-sm text-muted-foreground">{statusLabel}</p>
		</div>
	);
}

function TabButton({
	label,
	value,
	activeTab,
	onClick,
	disabled,
	title,
}: {
	label: string;
	value: "status" | "controls";
	activeTab: "status" | "controls";
	onClick: (value: "status" | "controls") => void;
	disabled?: boolean;
	title?: string;
}) {
	return (
		<button
			type="button"
			onClick={() => {
				if (!disabled) {
					onClick(value);
				}
			}}
			disabled={disabled}
			title={title}
			className={`rounded-md px-3 py-1.5 text-sm ${
				activeTab === value
					? "bg-primary text-primary-foreground"
					: "border border-border hover:bg-muted"
			} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
		>
			{label}
		</button>
	);
}

function CheckInWizard({
	userId,
	disabled,
	onSuccess,
}: {
	userId: string;
	disabled: boolean;
	onSuccess: () => void;
}) {
	const [state, dispatch] = useReducer(checkInReducer, initialCheckInState);
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
		onSuccess: () => {
			onSuccess();
			dispatch({ type: "reset" });
		},
	});

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

	const isRoomAllotmentValid =
		Boolean(state.hostelName?.trim()) && Boolean(state.floor?.trim());

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
			state.depositVerified === true &&
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
					? state.paymentVerified
					: state.step === 4
						? state.depositVerified
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
		if (state.step === 2 && state.accommodationRequired === true) {
			const pricingResult = await calculateTotalMutation.mutateAsync(
				state.nightsRequested,
			);

			dispatch({
				type: "setPricingPreview",
				roomPrice: pricingResult.roomPrice,
				accommodationPreviewTotal: pricingResult.total,
			});
		}

		dispatch({ type: "nextStep" });
	};

	return (
		<div className="rounded-md border border-border bg-card p-4">
			<h4 className="text-sm font-medium">CheckInWizard</h4>
			<p className="mt-2 text-xs text-muted-foreground">
				Step {currentFlowStep} of {totalFlowSteps}
			</p>

			<div className="mt-3 max-h-[45vh] space-y-3 overflow-y-auto pr-1 text-sm">
				{state.step === 1 ? (
					<div className="space-y-2">
						<p className="font-medium">1. Accommodation required</p>
						<div
							role="radiogroup"
							aria-label="Accommodation required"
							className="space-y-2"
						>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="accommodation-required"
									value="yes"
									checked={state.accommodationRequired === true}
									onChange={() =>
										dispatch({
											type: "setAccommodationRequired",
											value: true,
										})
									}
									disabled={disabled || createStayMutation.isPending}
								/>
								<span>Yes</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="radio"
									name="accommodation-required"
									value="no"
									checked={state.accommodationRequired === false}
									onChange={() =>
										dispatch({
											type: "setAccommodationRequired",
											value: false,
										})
									}
									disabled={disabled || createStayMutation.isPending}
								/>
								<span>No</span>
							</label>
						</div>
					</div>
				) : null}

				{state.step === 2 ? (
					<div className="space-y-2">
						<p className="font-medium">2. Nights requested</p>
						<input
							type="number"
							min={0}
							value={state.nightsRequested}
							onChange={(event) =>
								dispatch({
									type: "setNightsRequested",
									value: Number(event.target.value),
								})
							}
							disabled={
								disabled ||
								!state.accommodationRequired ||
								createStayMutation.isPending
							}
							className="w-full rounded-md border border-border bg-background px-3 py-2"
						/>
						{state.accommodationRequired && state.nightsRequested <= 0 ? (
							<p className="text-xs text-muted-foreground">
								Enter nights greater than 0.
							</p>
						) : null}
					</div>
				) : null}

				{state.step === 3 ? (
					<div className="space-y-6">
						<p className="font-medium">3. Payment verification</p>

						<div className="rounded-lg border border-primary/30 bg-emerald-500/10 p-4">
							<p className="text-sm text-emerald-600">
								Total Accommodation Fee
							</p>
							<p className="text-2xl font-bold text-emerald-600">
								₹{previewTotal}
							</p>
						</div>

						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<p className="font-medium">
									Confirm Accommodation Payment Received
								</p>
								<p className="text-sm text-muted-foreground">
									Verify that the full amount has been paid.
								</p>
							</div>

							<label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1">
								<span>Yes</span>
								<input
									type="checkbox"
									checked={state.paymentVerified}
									onChange={(event) =>
										dispatch({
											type: "setPaymentVerified",
											value: event.target.checked,
										})
									}
									disabled={disabled || createStayMutation.isPending}
									className="h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-primary"
								/>
							</label>
						</div>
					</div>
				) : null}

				{state.step === 4 ? (
					<div className="space-y-6">
						<p className="font-medium">4. Deposit verification</p>

						<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
							<p className="text-sm text-emerald-600">Caution Deposit Amount</p>
							<p className="text-2xl font-bold text-emerald-600">
								₹{depositAmount}
							</p>
						</div>

						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
							<div>
								<p className="font-medium">Confirm Caution Deposit Received</p>
								<p className="text-sm text-muted-foreground">
									Verify that the caution deposit has been collected.
								</p>
							</div>

							<label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1">
								<span>Yes</span>
								<input
									type="checkbox"
									checked={state.depositVerified}
									onChange={(event) =>
										dispatch({
											type: "setDepositVerified",
											value: event.target.checked,
										})
									}
									disabled={disabled || createStayMutation.isPending}
									className="h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-primary"
								/>
							</label>
						</div>
					</div>
				) : null}

				{state.step === 5 ? (
					<div className="space-y-2">
						<p className="font-medium">5. Room allotment</p>
						<div className="space-y-2">
							<label
								htmlFor={hostelInputId}
								className="block text-xs text-muted-foreground"
							>
								Hostel Name
							</label>
							<input
								id={hostelInputId}
								type="text"
								placeholder="Hostel name"
								value={state.hostelName ?? ""}
								onChange={(event) =>
									dispatch({
										type: "setHostelName",
										value: event.target.value,
									})
								}
								disabled={disabled || createStayMutation.isPending}
								className="w-full rounded-md border border-border bg-background px-3 py-2"
							/>

							<label
								htmlFor={floorInputId}
								className="block text-xs text-muted-foreground"
							>
								Floor
							</label>
							<input
								id={floorInputId}
								type="text"
								placeholder="Floor"
								value={state.floor ?? ""}
								onChange={(event) =>
									dispatch({ type: "setFloor", value: event.target.value })
								}
								disabled={disabled || createStayMutation.isPending}
								className="w-full rounded-md border border-border bg-background px-3 py-2"
							/>
						</div>
					</div>
				) : null}

				{state.step === 6 ? (
					<div className="mx-auto max-w-2xl space-y-8">
						<p className="font-medium">6. Detailed review</p>
						{state.accommodationRequired === false ? (
							<div className="rounded-xl border bg-muted/40 p-6 text-center">
								<p className="text-lg font-semibold">
									No Accommodation Requested
								</p>
								<p className="mt-2 text-sm text-muted-foreground">
									No room assigned and no charges applicable.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
									<h5 className="text-sm font-semibold">Stay Overview</h5>
									<div className="grid grid-cols-2 gap-y-3 text-sm">
										<span className="text-muted-foreground">Accommodation</span>
										<span className="text-right font-medium">Yes</span>
										<span className="text-muted-foreground">
											Nights Requested
										</span>
										<span className="text-right font-medium">
											{state.nightsRequested}
										</span>
									</div>
								</div>

								<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
									<h5 className="text-sm font-semibold">Financial Summary</h5>
									<div className="grid grid-cols-2 gap-y-3 text-sm">
										<span className="text-muted-foreground">Room Fee</span>
										<span className="text-right font-medium">
											₹{previewTotal}
										</span>
										<span className="text-muted-foreground">
											Caution Deposit
										</span>
										<span className="text-right font-medium">
											₹{depositAmount}
										</span>
									</div>
									<div className="flex justify-between border-t pt-3 text-base font-semibold">
										<span>Total Payable</span>
										<span className="text-primary">₹{totalPayable}</span>
									</div>
								</div>

								<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
									<h5 className="text-sm font-semibold">Room Allotment</h5>
									<div className="grid grid-cols-2 gap-y-3 text-sm">
										<span className="text-muted-foreground">Hostel</span>
										<span className="text-right font-medium">
											{state.hostelName}
										</span>
										<span className="text-muted-foreground">Floor</span>
										<span className="text-right font-medium">
											{state.floor}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				) : null}

				{state.step === 7 ? (
					<div className="mx-auto max-w-2xl space-y-8">
						<div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
							<div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								Final Step
							</div>
							<h5 className="text-2xl font-semibold text-foreground">
								Confirm Check-In
							</h5>

							{state.accommodationRequired === false ? (
								<p className="text-sm text-muted-foreground">
									No accommodation requested.
								</p>
							) : (
								<div className="space-y-3">
									<div className="text-3xl font-bold text-primary">
										₹{previewTotal}
									</div>
									<p className="text-sm text-muted-foreground">
										Accommodation fee confirmed.
									</p>
									<p className="text-sm text-foreground">
										Caution deposit: ₹{depositAmount}
									</p>
								</div>
							)}
						</div>
					</div>
				) : null}
			</div>

			{calculateTotalMutation.isError ? (
				<p className="mt-3 text-xs text-muted-foreground">
					{calculateTotalMutation.error instanceof Error
						? calculateTotalMutation.error.message
						: "Failed to calculate accommodation total."}
				</p>
			) : null}

			{createStayMutation.isError ? (
				<p className="mt-3 text-xs text-muted-foreground">
					{createStayMutation.error instanceof Error
						? createStayMutation.error.message
						: "Failed to create stay."}
				</p>
			) : null}

			<div className="mt-4 flex items-center gap-2">
				{state.step < 7 ? (
					<>
						<button
							type="button"
							onClick={() => dispatch({ type: "prevStep" })}
							disabled={
								disabled || state.step === 1 || createStayMutation.isPending
							}
							className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
								calculateTotalMutation.isPending
							}
							className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
							onClick={() => createStayMutation.mutate()}
							disabled={
								disabled ||
								createStayMutation.isPending ||
								(state.accommodationRequired === true && !isStepValid())
							}
							className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{createStayMutation.isPending ? "Saving..." : "Confirm Check-In"}
						</button>

						<button
							type="button"
							onClick={() => dispatch({ type: "prevStep" })}
							disabled={disabled || createStayMutation.isPending}
							className="w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
						>
							Back
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

function CheckOutWizard({
	userId,
	disabled,
	onSuccess,
}: {
	userId: string;
	disabled: boolean;
	onSuccess: () => void;
}) {
	const [state, dispatch] = useReducer(checkOutReducer, initialCheckOutState);

	const {
		data: detailsData,
		isLoading: isDetailsLoading,
		isError: isDetailsError,
		error: detailsError,
	} = useQuery({
		queryKey: ["pr", "onboarding", "stay-details", userId],
		queryFn: () => getStayDetails({ data: { userId } }),
	});

	const completeStayMutation = useMutation({
		mutationFn: async () =>
			completeStay({
				data: {
					userId,
					fineAmount: state.fineAmount,
					finePaid: state.finePaid,
					cautionReturned: state.cautionReturned,
				},
			}),
		onSuccess: () => {
			onSuccess();
			dispatch({ type: "reset" });
		},
	});

	const overstayed = detailsData?.overstayed ?? false;
	const elapsedDays = detailsData?.elapsedDays ?? 0;
	const nightsRequested = detailsData?.nightsRequested ?? 0;

	const canProceedFromCurrentStep =
		state.step === 1
			? !isDetailsLoading && !isDetailsError
			: state.step === 3
				? state.finePaid
				: state.step === 4
					? state.cautionReturned
					: true;

	return (
		<div className="rounded-md border border-border bg-card p-4">
			<h4 className="text-sm font-medium">CheckOutWizard</h4>
			<p className="mt-2 text-xs text-muted-foreground">
				Step {state.step} of 5
			</p>

			<div className="mt-3 space-y-3 text-sm">
				{state.step === 1 ? (
					<div className="space-y-2">
						<p className="font-medium">1. Overstay status</p>
						{isDetailsLoading ? (
							<p className="text-muted-foreground">Loading stay details...</p>
						) : null}
						{isDetailsError ? (
							<p className="text-muted-foreground">
								{detailsError instanceof Error
									? detailsError.message
									: "Failed to load stay details."}
							</p>
						) : null}
						{!isDetailsLoading && !isDetailsError ? (
							<>
								<p className="text-muted-foreground">
									Nights requested: {nightsRequested}, elapsed: {elapsedDays}
								</p>
								{overstayed ? (
									<p className="text-muted-foreground">
										Overstay warning: user has exceeded requested nights.
									</p>
								) : (
									<p className="text-muted-foreground">No overstay detected.</p>
								)}
							</>
						) : null}
					</div>
				) : null}

				{state.step === 2 ? (
					<div className="space-y-2">
						<p className="font-medium">2. Set fine (if any)</p>
						<input
							type="number"
							min={0}
							value={state.fineAmount}
							onChange={(event) =>
								dispatch({
									type: "setFineAmount",
									value: Number(event.target.value),
								})
							}
							disabled={disabled || completeStayMutation.isPending}
							className="w-full rounded-md border border-border bg-background px-3 py-2"
						/>
					</div>
				) : null}

				{state.step === 3 ? (
					<div className="space-y-2">
						<p className="font-medium">3. Confirm fine paid</p>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={state.finePaid}
								onChange={(event) =>
									dispatch({
										type: "setFinePaid",
										value: event.target.checked,
									})
								}
								disabled={disabled || completeStayMutation.isPending}
							/>
							<span>Fine paid confirmed</span>
						</label>
					</div>
				) : null}

				{state.step === 4 ? (
					<div className="space-y-2">
						<p className="font-medium">4. Confirm deposit returned</p>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={state.cautionReturned}
								onChange={(event) =>
									dispatch({
										type: "setCautionReturned",
										value: event.target.checked,
									})
								}
								disabled={disabled || completeStayMutation.isPending}
							/>
							<span>Deposit returned confirmed</span>
						</label>
					</div>
				) : null}

				{state.step === 5 ? (
					<div className="space-y-1 text-muted-foreground">
						<p className="font-medium text-foreground">5. Final confirmation</p>
						<p>Fine amount: ₹{state.fineAmount}</p>
						<p>Fine paid: {state.finePaid ? "Yes" : "No"}</p>
						<p>Deposit returned: {state.cautionReturned ? "Yes" : "No"}</p>
					</div>
				) : null}
			</div>

			{completeStayMutation.isError ? (
				<p className="mt-3 text-xs text-muted-foreground">
					{completeStayMutation.error instanceof Error
						? completeStayMutation.error.message
						: "Failed to complete stay."}
				</p>
			) : null}

			<div className="mt-4 flex items-center gap-2">
				<button
					type="button"
					onClick={() => dispatch({ type: "prevStep" })}
					disabled={
						disabled || state.step === 1 || completeStayMutation.isPending
					}
					className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
				>
					Back
				</button>

				{state.step < 5 ? (
					<button
						type="button"
						onClick={() => dispatch({ type: "nextStep" })}
						disabled={
							disabled ||
							!canProceedFromCurrentStep ||
							completeStayMutation.isPending
						}
						className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
					>
						Next
					</button>
				) : (
					<button
						type="button"
						onClick={() => completeStayMutation.mutate()}
						disabled={
							disabled ||
							!state.finePaid ||
							!state.cautionReturned ||
							completeStayMutation.isPending
						}
						className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
					>
						{completeStayMutation.isPending ? "Saving..." : "Confirm Check-Out"}
					</button>
				)}
			</div>
		</div>
	);
}

function ControlsPanel({
	userId,
	status,
	onCheckInSuccess,
	onCheckOutSuccess,
	checkInResetSignal,
	checkOutResetSignal,
}: {
	userId: string;
	status: StayStatus;
	onCheckInSuccess: () => void;
	onCheckOutSuccess: () => void;
	checkInResetSignal: number;
	checkOutResetSignal: number;
}) {
	const hasCheckedOut = !!status.checkedOutAt;
	const hasCheckedInOnly = !!status.checkedInAt && !hasCheckedOut;
	const hasNoRecord = !status.exists;
	const checkInTabDisabled = !!status.checkedInAt;
	const [activeWizardTab, setActiveWizardTab] = useState<
		"checkin" | "checkout"
	>("checkin");

	const checkoutDisabled =
		!status.exists || !status.checkedInAt || !!status.checkedOutAt;

	useEffect(() => {
		if (checkoutDisabled && activeWizardTab === "checkout") {
			setActiveWizardTab("checkin");
		}
	}, [checkoutDisabled, activeWizardTab]);

	useEffect(() => {
		if (hasCheckedInOnly) {
			setActiveWizardTab("checkout");
		}
	}, [hasCheckedInOnly]);

	const disableAllControls = hasCheckedOut;
	const isCheckInDisabled =
		disableAllControls ||
		(hasCheckedInOnly && status.exists) ||
		(!hasNoRecord && !hasCheckedInOnly);
	const isCheckOutDisabled =
		disableAllControls || hasNoRecord || !hasCheckedInOnly;

	return (
		<div className="space-y-3 rounded-md border border-border bg-card p-4">
			<h3 className="text-sm font-medium">ControlsPanel</h3>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {
						if (!checkInTabDisabled) {
							setActiveWizardTab("checkin");
						}
					}}
					disabled={checkInTabDisabled}
					title={
						checkInTabDisabled
							? "User has already completed check-in"
							: undefined
					}
					className={`rounded-md px-3 py-1.5 text-sm ${
						activeWizardTab === "checkin"
							? "bg-primary text-primary-foreground"
							: "border border-border hover:bg-muted"
					} ${checkInTabDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					Check-In
				</button>

				<button
					type="button"
					onClick={() => {
						if (!checkoutDisabled) {
							setActiveWizardTab("checkout");
						}
					}}
					disabled={checkoutDisabled}
					title={
						checkoutDisabled ? "User must complete check-in first" : undefined
					}
					className={`rounded-md px-3 py-1.5 text-sm ${
						activeWizardTab === "checkout"
							? "bg-primary text-primary-foreground"
							: "border border-border hover:bg-muted"
					} ${checkoutDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					Check-Out
				</button>
			</div>

			{activeWizardTab === "checkin" ? (
				<CheckInWizard
					key={`check-in-${userId}-${checkInResetSignal}`}
					userId={userId}
					disabled={isCheckInDisabled}
					onSuccess={onCheckInSuccess}
				/>
			) : null}

			{activeWizardTab === "checkout" ? (
				<CheckOutWizard
					key={`check-out-${userId}-${checkOutResetSignal}`}
					userId={userId}
					disabled={isCheckOutDisabled}
					onSuccess={onCheckOutSuccess}
				/>
			) : null}
		</div>
	);
}

export function OnboardingModal({
	userId,
	onClose,
}: {
	userId: string;
	onClose: () => void;
}) {
	const [activeTab, setActiveTab] = useState<"status" | "controls">("status");
	const [checkInResetSignal, setCheckInResetSignal] = useState(0);
	const [checkOutResetSignal, setCheckOutResetSignal] = useState(0);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["pr", "onboarding", "stay-status", userId],
		queryFn: () => getStayStatus({ data: { userId } }),
	});

	const status: StayStatus = {
		exists: data?.exists ?? false,
		checkedInAt: data?.checkedInAt ?? null,
		checkedOutAt: data?.checkedOutAt ?? null,
	};
	const controlsTabDisabled = !!status.checkedOutAt;

	useEffect(() => {
		if (!isLoading && !isError && data) {
			setActiveTab(data.exists ? "controls" : "status");
		}
	}, [isLoading, isError, data]);

	useEffect(() => {
		if (controlsTabDisabled && activeTab === "controls") {
			setActiveTab("status");
		}
	}, [controlsTabDisabled, activeTab]);

	const handleModalClose = () => {
		setCheckInResetSignal((currentValue) => currentValue + 1);
		setCheckOutResetSignal((currentValue) => currentValue + 1);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-2xl rounded-md border border-border bg-background shadow-lg">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">Onboarding</h2>
					<button
						type="button"
						onClick={handleModalClose}
						className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
					>
						Close
					</button>
				</div>

				<div className="space-y-3 p-4">
					<div className="text-sm text-muted-foreground">User ID: {userId}</div>

					{isLoading ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Loading onboarding status...
						</div>
					) : null}

					{isError ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Failed to load onboarding status.
						</div>
					) : null}

					{!isLoading && !isError ? (
						<>
							<div className="flex items-center gap-2">
								<TabButton
									label="Status"
									value="status"
									activeTab={activeTab}
									onClick={setActiveTab}
								/>
								<TabButton
									label="Controls"
									value="controls"
									activeTab={activeTab}
									onClick={setActiveTab}
									disabled={controlsTabDisabled}
									title={
										controlsTabDisabled
											? "Stay completed. No further changes allowed."
											: undefined
									}
								/>
							</div>

							{controlsTabDisabled ? (
								<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
									Stay completed. No further changes allowed.
								</div>
							) : null}

							{activeTab === "status" ? <StatusPanel status={status} /> : null}

							{activeTab === "controls" ? (
								<ControlsPanel
									userId={userId}
									status={status}
									onCheckInSuccess={async () => {
										await refetch();
										handleModalClose();
									}}
									onCheckOutSuccess={async () => {
										await refetch();
										setCheckOutResetSignal((currentValue) => currentValue + 1);
									}}
									checkInResetSignal={checkInResetSignal}
									checkOutResetSignal={checkOutResetSignal}
								/>
							) : null}
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
