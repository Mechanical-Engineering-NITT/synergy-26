import type { Dispatch } from "react";
import type { CheckOutAction, CheckOutState } from "../types";

type StepProps = {
	state: CheckOutState;
	dispatch: Dispatch<CheckOutAction>;
	disabled: boolean;
	completePending: boolean;
};

export function Step1NoAccommodationInfo() {
	return (
		<div className="rounded-xl border bg-muted/40 p-6 text-center space-y-3">
			<p className="text-lg font-semibold">No Accommodation Stay</p>
			<p className="text-sm text-muted-foreground">
				This user did not request accommodation.
			</p>
			<p className="text-sm text-muted-foreground">
				No overstay, fine, or deposit processing required.
			</p>
		</div>
	);
}

export function Step2NoAccommodationReview({
	checkedInAt,
}: {
	checkedInAt: Date | null;
}) {
	return (
		<div className="space-y-6">
			<p className="font-medium">2. Detailed review</p>

			<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-muted-foreground">Check-In Timestamp</span>
					<span className="text-right font-medium">
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span className="text-muted-foreground">Check-Out</span>
					<span className="text-right font-medium">Pending</span>
					<span className="text-muted-foreground">Accommodation</span>
					<span className="text-right font-medium">Not Requested</span>
					<span className="text-muted-foreground">Charges</span>
					<span className="text-right font-medium">₹0</span>
					<span className="text-muted-foreground">Deposit</span>
					<span className="text-right font-medium">Not Applicable</span>
					<span className="text-muted-foreground">Fine</span>
					<span className="text-right font-medium">Not Applicable</span>
				</div>
			</div>
		</div>
	);
}

export function Step3NoAccommodationConfirm() {
	return (
		<div className="max-w-md mx-auto bg-card border rounded-2xl shadow-md p-8 text-center space-y-6">
			<p className="text-xl font-semibold">Confirm Check-Out</p>
			<p className="text-base">No accommodation was requested.</p>
			<p className="text-sm text-muted-foreground">
				No charges or deposits involved.
			</p>
		</div>
	);
}

export function Step1Overstay({
	isDetailsLoading,
	isDetailsError,
	detailsError,
	overstayed,
	overstayDays,
}: {
	isDetailsLoading: boolean;
	isDetailsError: boolean;
	detailsError: unknown;
	overstayed: boolean;
	overstayDays: number;
}) {
	return (
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
				<div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
					{overstayed ? (
						<div className="rounded-lg border border-red-400 bg-red-100 p-4 text-sm text-red-700">
							User has overstayed. Edit Check-In to adjust nights and fee.
						</div>
					) : null}

					{overstayed ? (
						<>
							<h5 className="text-2xl font-semibold">Overstay Detected</h5>
							<div className="text-3xl font-bold text-red-600">
								{overstayDays} Extra Days
							</div>
							<p className="text-sm text-muted-foreground">
								User has exceeded approved stay duration.
							</p>
						</>
					) : (
						<>
							<h5 className="text-2xl font-semibold">Stay Within Limit</h5>
							<div className="text-3xl font-bold text-emerald-600">
								No Overstay
							</div>
							<p className="text-sm text-muted-foreground">
								User stayed within approved duration.
							</p>
						</>
					)}
				</div>
			) : null}
		</div>
	);
}

export function Step2FineApplicable({
	state,
	dispatch,
	disabled,
	completePending,
}: StepProps) {
	return (
		<div className="space-y-2">
			<p className="font-medium">2. Fine applicable?</p>
			<div role="radiogroup" aria-label="Fine applicable" className="space-y-2">
				<label className="flex items-center gap-2">
					<input
						type="radio"
						name="fine-applicable"
						value="yes"
						checked={state.fineApplicable === true}
						onChange={() =>
							dispatch({
								type: "setFineApplicable",
								value: true,
							})
						}
						disabled={disabled || completePending}
					/>
					<span>Yes</span>
				</label>
				<label className="flex items-center gap-2">
					<input
						type="radio"
						name="fine-applicable"
						value="no"
						checked={state.fineApplicable === false}
						onChange={() =>
							dispatch({
								type: "setFineApplicable",
								value: false,
							})
						}
						disabled={disabled || completePending}
					/>
					<span>No</span>
				</label>
			</div>
		</div>
	);
}

export function Step3SetFine({
	state,
	dispatch,
	disabled,
	completePending,
}: StepProps) {
	return (
		<div className="space-y-2">
			<p className="font-medium">3. Set fine amount</p>
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
				disabled={disabled || completePending || state.fineApplicable !== true}
				className="w-full rounded-md border border-border bg-background px-3 py-2"
			/>
			{state.fineApplicable === true && state.fineAmount <= 0 ? (
				<p className="text-xs text-muted-foreground">
					Enter fine amount greater than 0.
				</p>
			) : null}
		</div>
	);
}

export function Step4FinePaid({
	state,
	dispatch,
	disabled,
	completePending,
}: StepProps) {
	return (
		<div className="space-y-6">
			<p className="font-medium">4. Fine paid verification</p>

			<div className="space-y-3 rounded-lg border border-yellow-400 bg-yellow-100 p-4">
				<div className="text-sm font-medium">Fine Amount</div>
				<div className="text-2xl font-bold text-yellow-700">
					₹{state.fineAmount}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Fine Paid</p>
				<label className="flex items-center gap-2">
					<span>Yes</span>
					<input
						type="checkbox"
						checked={state.finePaid}
						onChange={(event) =>
							dispatch({
								type: "setFinePaid",
								value: event.target.checked,
							})
						}
						disabled={disabled || completePending}
					/>
				</label>
			</div>
		</div>
	);
}

export function Step5DepositReturn({
	state,
	dispatch,
	disabled,
	completePending,
	cautionDeposit,
}: StepProps & { cautionDeposit: number }) {
	return (
		<div className="space-y-6">
			<p className="font-medium">5. Deposit return verification</p>

			<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
				<p className="text-sm text-muted-foreground">
					Caution Deposit to Return
				</p>
				<p className="text-2xl font-bold text-emerald-600">₹{cautionDeposit}</p>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Deposit Returned</p>
				<label className="flex items-center gap-2">
					<span>Yes</span>
					<input
						type="checkbox"
						checked={state.cautionReturned}
						onChange={(event) =>
							dispatch({
								type: "setCautionReturned",
								value: event.target.checked,
							})
						}
						disabled={disabled || completePending}
					/>
				</label>
			</div>
		</div>
	);
}

export function Step6Review({
	state,
	checkedInAt,
	elapsedDays,
}: {
	state: CheckOutState;
	checkedInAt: Date | null;
	elapsedDays: number;
}) {
	return (
		<div className="space-y-6">
			<p className="font-medium">6. Detailed review</p>

			<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-muted-foreground">Checked In At</span>
					<span className="text-right font-medium">
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span className="text-muted-foreground">Checked Out At</span>
					<span className="text-right font-medium">Pending</span>
					<span className="text-muted-foreground">Elapsed Days</span>
					<span className="text-right font-medium">{elapsedDays}</span>
				</div>
			</div>

			<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
				<h5 className="text-sm font-semibold">Financial Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-muted-foreground">Fine Applicable</span>
					<span className="text-right font-medium">
						{state.fineApplicable ? "Yes" : "No"}
					</span>
					<span className="text-muted-foreground">Fine Applied</span>
					<span className="text-right font-semibold">₹{state.fineAmount}</span>
					{state.fineApplicable === true ? (
						<>
							<span className="text-muted-foreground">Fine Paid</span>
							<span className="text-right font-medium">Yes</span>
						</>
					) : null}
					<span className="text-muted-foreground">Deposit Returned</span>
					<span className="text-right font-medium">
						{state.fineApplicable === true
							? "No (Retained)"
							: state.cautionReturned
								? "Yes"
								: "No"}
					</span>
				</div>
			</div>
		</div>
	);
}

export function Step7Confirm({ state }: { state: CheckOutState }) {
	return (
		<div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
			<h5 className="text-2xl font-semibold">Confirm Check-Out</h5>
			{state.fineApplicable === true ? (
				<>
					<div className="text-base font-medium text-foreground">
						Fine Applied: ₹{state.fineAmount}
					</div>
					<div className="text-sm text-muted-foreground">
						Fine Paid Confirmed
					</div>
					<p className="text-sm text-muted-foreground">Deposit Retained</p>
				</>
			) : (
				<>
					<div className="text-3xl font-bold text-emerald-600">
						No Fine Applied
					</div>
					<p className="text-sm text-muted-foreground">Deposit Returned: Yes</p>
				</>
			)}
		</div>
	);
}
