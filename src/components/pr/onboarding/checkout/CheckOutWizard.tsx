import { useMutation, useQuery } from "@tanstack/react-query";
import { useReducer } from "react";
import { completeStay } from "@/server/admin/admin.pr.completeStay";
import { getStayDetails } from "@/server/admin/admin.pr.getStayDetails";
import {
	checkOutReducer,
	createInitialCheckOutState,
	isCheckOutFinalStateValid,
} from "./checkOutReducer";
import {
	Step1Overstay,
	Step2FineApplicable,
	Step3SetFine,
	Step4FinePaid,
	Step5DepositReturn,
	Step6Review,
	Step7Confirm,
} from "./checkOutSteps";

export function CheckOutWizard({
	userId,
	disabled,
	onSuccess,
}: {
	userId: string;
	disabled: boolean;
	onSuccess: () => void;
}) {
	const [state, dispatch] = useReducer(
		checkOutReducer,
		undefined,
		createInitialCheckOutState,
	);

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
	const cautionDeposit = detailsData?.stayData?.cautionDeposit ?? 0;
	const checkedInAt = detailsData?.stayData?.checkedInAt ?? null;
	const checkedOutAt = detailsData?.stayData?.checkedOutAt ?? null;
	const overstayDays = Math.max(0, elapsedDays - nightsRequested);

	const isFinalStateValid = isCheckOutFinalStateValid({
		checkedInAt,
		checkedOutAt,
		state,
	});

	const canProceedFromCurrentStep =
		state.step === 1
			? !isDetailsLoading && !isDetailsError
			: state.step === 2
				? state.fineApplicable !== null
				: state.step === 3
					? state.fineAmount > 0
					: state.step === 4
						? state.finePaid
						: state.step === 5
							? state.cautionReturned
							: true;

	const totalFlowSteps = state.fineApplicable === false ? 5 : 6;
	const currentFlowStep =
		state.fineApplicable === false
			? state.step === 1
				? 1
				: state.step === 2
					? 2
					: state.step === 5
						? 3
						: state.step === 6
							? 4
							: 5
			: state.step === 1
				? 1
				: state.step === 2
					? 2
					: state.step === 3
						? 3
						: state.step === 4
							? 4
							: state.step === 6
								? 5
								: 6;

	return (
		<div className="rounded-md border border-border bg-card p-4">
			<h4 className="text-sm font-medium">CheckOutWizard</h4>
			<p className="mt-2 text-xs text-muted-foreground">
				Step {currentFlowStep} of {totalFlowSteps}
			</p>

			<div className="mt-3 space-y-3 text-sm">
				{state.step === 1 ? (
					<Step1Overstay
						isDetailsLoading={isDetailsLoading}
						isDetailsError={isDetailsError}
						detailsError={detailsError}
						overstayed={overstayed}
						overstayDays={overstayDays}
					/>
				) : null}

				{state.step === 2 ? (
					<Step2FineApplicable
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				) : null}

				{state.step === 3 ? (
					<Step3SetFine
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				) : null}

				{state.step === 4 && state.fineApplicable === true ? (
					<Step4FinePaid
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
					/>
				) : null}

				{state.step === 5 && state.fineApplicable === false ? (
					<Step5DepositReturn
						state={state}
						dispatch={dispatch}
						disabled={disabled}
						completePending={completeStayMutation.isPending}
						cautionDeposit={cautionDeposit}
					/>
				) : null}

				{state.step === 6 ? (
					<Step6Review
						state={state}
						checkedInAt={checkedInAt}
						elapsedDays={elapsedDays}
					/>
				) : null}

				{state.step === 7 ? <Step7Confirm state={state} /> : null}
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

				{state.step < 7 ? (
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
							disabled || !isFinalStateValid || completeStayMutation.isPending
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
