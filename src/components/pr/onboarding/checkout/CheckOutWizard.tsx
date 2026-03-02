import { useMutation } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";
import { completeStay } from "@/server/admin/admin.pr.completeStay";
import type { StayFullDetails } from "../types";
import {
	buildInitialCheckoutStateFromStay,
	checkOutReducer,
	isCheckOutFinalStateValid,
} from "./checkOutReducer";
import {
	Step1NoAccommodationInfo,
	Step1Overstay,
	Step2FineApplicable,
	Step2NoAccommodationReview,
	Step3NoAccommodationConfirm,
	Step3SetFine,
	Step4FinePaid,
	Step5DepositReturn,
	Step6Review,
	Step7Confirm,
} from "./checkOutSteps";

export function CheckOutWizard({
	userId,
	mode: _mode,
	stay,
	disabled,
	onComplete,
}: {
	userId: string;
	stay: StayFullDetails;
	mode: "create" | "edit";
	disabled: boolean;
	onComplete: () => Promise<void>;
}) {
	const [state, dispatch] = useReducer(
		checkOutReducer,
		buildInitialCheckoutStateFromStay(stay),
	);

	const completeStayMutation = useMutation({
		mutationFn: async () =>
			completeStay({
				data: {
					userId,
					fineAmount: isNoAccommodation ? 0 : state.fineAmount,
					finePaid: isNoAccommodation ? false : state.finePaid,
					cautionReturned: isNoAccommodation ? false : state.cautionReturned,
				},
			}),
	});

	const handleFinalSubmit = async () => {
		try {
			await completeStayMutation.mutateAsync();
			await onComplete();
			dispatch({ type: "reset" });
		} catch {}
	};

	const overstayed = stay.overstayed ?? false;
	const elapsedDays = stay.elapsedDays ?? 0;
	const nightsRequested = stay.nightsRequested ?? 0;
	const cautionDeposit = stay.cautionDeposit ?? 0;
	const checkedInAt = stay.checkedInAt ?? null;
	const overstayDays = Math.max(0, elapsedDays - nightsRequested);
	const isNoAccommodation = stay?.accommodationRequired === false;

	useEffect(() => {
		dispatch({
			type: "INITIALIZE_FROM_STAY",
			payload: {
				accommodationRequired: stay.accommodationRequired,
				fineAmount: stay.fineAmount,
				finePaid: stay.finePaid,
				cautionReturned: stay.cautionReturned,
			},
		});
	}, [stay]);

	const isFinalStateValid = isNoAccommodation
		? Boolean(checkedInAt) &&
			state.fineAmount === 0 &&
			state.finePaid === false &&
			state.cautionReturned === false
		: isCheckOutFinalStateValid({
				checkedInAt,
				state,
			});

	const canProceedFromCurrentStep =
		isNoAccommodation && state.step === 1
			? true
			: isNoAccommodation && state.step === 2
				? true
				: state.step === 1
					? true
					: state.step === 2
						? state.fineApplicable !== null
						: state.step === 3
							? state.fineAmount > 0
							: state.step === 4
								? state.finePaid
								: state.step === 5
									? state.cautionReturned
									: true;

	const getTotalSteps = () => {
		if (isNoAccommodation) {
			return 3;
		}

		if (state.fineApplicable === false) {
			return 5;
		}

		if (state.fineApplicable === true) {
			return 6;
		}

		return 2;
	};

	const getDisplayStepNumber = () => {
		if (isNoAccommodation) {
			if (state.step === 1) {
				return 1;
			}

			if (state.step === 2) {
				return 2;
			}

			return 3;
		}

		if (state.fineApplicable === false) {
			if (state.step === 1) {
				return 1;
			}

			if (state.step === 2) {
				return 2;
			}

			if (state.step === 5) {
				return 3;
			}

			if (state.step === 6) {
				return 4;
			}

			return 5;
		}

		if (state.fineApplicable === true) {
			if (state.step === 1) {
				return 1;
			}

			if (state.step === 2) {
				return 2;
			}

			if (state.step === 3) {
				return 3;
			}

			if (state.step === 4) {
				return 4;
			}

			if (state.step === 6) {
				return 5;
			}

			return 6;
		}

		if (state.step === 1) {
			return 1;
		}

		return 2;
	};

	const totalSteps = getTotalSteps();
	const displayStepNumber = getDisplayStepNumber();

	const isFinalStep = isNoAccommodation ? state.step === 3 : state.step === 7;

	const handleNext = () => {
		dispatch({ type: "nextStep", stay });
	};

	const handleBack = () => {
		dispatch({ type: "prevStep", stay });
	};

	const renderStepContent = () => {
		switch (state.step) {
			case 1:
				return isNoAccommodation ? (
					<Step1NoAccommodationInfo />
				) : (
					<Step1Overstay
						isDetailsLoading={false}
						isDetailsError={false}
						detailsError={null}
						overstayed={overstayed}
						overstayDays={overstayDays}
					/>
				);
			case 2:
				return isNoAccommodation ? (
					<Step2NoAccommodationReview checkedInAt={checkedInAt} />
				) : (
					<Step2FineApplicable
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				);
			case 3:
				return isNoAccommodation ? (
					<Step3NoAccommodationConfirm />
				) : (
					<Step3SetFine
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				);
			case 4:
				return state.fineApplicable === true ? (
					<Step4FinePaid
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				) : null;
			case 5:
				return state.fineApplicable === false ? (
					<Step5DepositReturn
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
						cautionDeposit={cautionDeposit}
					/>
				) : null;
			case 6:
				return (
					<Step6Review
						state={state}
						checkedInAt={checkedInAt}
						elapsedDays={elapsedDays}
					/>
				);
			case 7:
				return <Step7Confirm state={state} />;
			default:
				return null;
		}
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
			<p style={{ marginTop: "8px", fontSize: "12px", color: "#71717a" }}>
				Step {displayStepNumber} of {totalSteps}
			</p>

			<div className="mt-3 space-y-3 text-sm">{renderStepContent()}</div>

			{completeStayMutation.isError ? (
				<p
					style={{
						marginTop: "12px",
						fontSize: "12px",
						color: "#ef4444",
						borderLeft: "3px solid #ef4444",
						paddingLeft: "8px",
					}}
				>
					{completeStayMutation.error instanceof Error
						? completeStayMutation.error.message
						: "Failed to complete stay."}
				</p>
			) : null}

			<div className="mt-4 flex items-center gap-2">
				<button
					type="button"
					onClick={handleBack}
					disabled={
						disabled || state.step === 1 || completeStayMutation.isPending
					}
					className="text-sm disabled:cursor-not-allowed"
					style={{
						backgroundColor:
							disabled || state.step === 1 || completeStayMutation.isPending
								? "#141414"
								: "transparent",
						color:
							disabled || state.step === 1 || completeStayMutation.isPending
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

				{!isFinalStep ? (
					<button
						type="button"
						onClick={handleNext}
						disabled={
							disabled ||
							!canProceedFromCurrentStep ||
							completeStayMutation.isPending
						}
						className="text-sm disabled:cursor-not-allowed"
						style={{
							backgroundColor:
								disabled ||
								!canProceedFromCurrentStep ||
								completeStayMutation.isPending
									? "#141414"
									: "#ffffff",
							color:
								disabled ||
								!canProceedFromCurrentStep ||
								completeStayMutation.isPending
									? "#71717a"
									: "#000000",
							borderRadius: "10px",
							padding: "8px 16px",
							fontWeight: 500,
							border:
								disabled ||
								!canProceedFromCurrentStep ||
								completeStayMutation.isPending
									? "1px solid #2a2a2a"
									: "1px solid #ffffff",
							transition: "opacity 0.2s ease",
						}}
					>
						Next
					</button>
				) : (
					<button
						type="button"
						onClick={() => {
							void handleFinalSubmit();
						}}
						disabled={
							disabled || !isFinalStateValid || completeStayMutation.isPending
						}
						className="text-sm disabled:cursor-not-allowed"
						style={{
							backgroundColor:
								disabled || !isFinalStateValid || completeStayMutation.isPending
									? "#141414"
									: "#ffffff",
							color:
								disabled || !isFinalStateValid || completeStayMutation.isPending
									? "#71717a"
									: "#000000",
							borderRadius: "10px",
							padding: "8px 16px",
							fontWeight: 500,
							border:
								disabled || !isFinalStateValid || completeStayMutation.isPending
									? "1px solid #2a2a2a"
									: "1px solid #ffffff",
							transition: "opacity 0.2s ease",
						}}
					>
						{completeStayMutation.isPending ? "Saving..." : "Confirm Check-Out"}
					</button>
				)}
			</div>
		</div>
	);
}
