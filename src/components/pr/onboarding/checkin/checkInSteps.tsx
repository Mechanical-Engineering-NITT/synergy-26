import type { Dispatch } from "react";
import type { CheckInAction, CheckInMode, CheckInState } from "../types";

type StepProps = {
	state: CheckInState;
	dispatch: Dispatch<CheckInAction>;
	disabled: boolean;
	mode: CheckInMode;
	createPending: boolean;
	updatePending: boolean;
};

export function Step1Accommodation({
	state,
	dispatch,
	disabled,
	mode,
	createPending,
	updatePending,
}: StepProps) {
	return (
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
						disabled={
							disabled || createPending || updatePending || mode === "edit"
						}
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
						disabled={
							disabled || createPending || updatePending || mode === "edit"
						}
					/>
					<span>No</span>
				</label>
			</div>
		</div>
	);
}

export function Step2Nights({
	state,
	disabled,
	createPending,
	updatePending,
	onNightsChange,
}: {
	state: CheckInState;
	disabled: boolean;
	createPending: boolean;
	updatePending: boolean;
	onNightsChange: (value: number) => void;
}) {
	return (
		<div className="space-y-2">
			<p className="font-medium">2. Nights requested</p>
			<input
				type="number"
				min={0}
				value={state.nightsRequested}
				onChange={(event) => onNightsChange(Number(event.target.value))}
				disabled={
					disabled ||
					!state.accommodationRequired ||
					createPending ||
					updatePending
				}
				className="w-full rounded-md border border-border bg-background px-3 py-2"
			/>
			{state.accommodationRequired && state.nightsRequested <= 0 ? (
				<p className="text-xs text-muted-foreground">
					Enter nights greater than 0.
				</p>
			) : null}
		</div>
	);
}

export function Step3Payment({
	state,
	dispatch,
	mode,
	isFeeUnchanged,
	previewTotal,
	disabled,
	createPending,
	updatePending,
}: StepProps & {
	isFeeUnchanged: boolean;
	previewTotal: number;
}) {
	return (
		<div className="space-y-6">
			<p className="font-medium">3. Payment verification</p>

			{mode === "edit" && isFeeUnchanged ? (
				<div className="space-y-3 rounded-lg border bg-muted/40 p-4">
					<div className="text-sm font-medium">
						Accommodation Payment Status
					</div>
					<div className="text-sm text-muted-foreground">
						Accommodation fee was verified during check-in.
					</div>
					<div className="text-base font-semibold text-primary">
						₹{state.originalAccommodationFee} — Already Paid
					</div>
				</div>
			) : (
				<>
					{mode === "edit" ? (
						<div className="space-y-3 rounded-lg border border-yellow-400 bg-yellow-100 p-4">
							<div className="text-sm text-muted-foreground">
								Previous Accommodation Fee
							</div>
							<div className="text-lg text-gray-500 line-through">
								₹{state.originalAccommodationFee}
							</div>
							<div className="text-sm font-medium">
								Updated Accommodation Fee
							</div>
							<div className="text-2xl font-bold text-yellow-700">
								₹{state.accommodationPreviewTotal}
							</div>
							<div className="text-sm text-yellow-800">
								To Pay: ₹{state.remainingToPay}
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-primary/30 bg-emerald-500/10 p-4">
							<p className="text-sm text-emerald-600">
								Total Accommodation Fee
							</p>
							<p className="text-2xl font-bold text-emerald-600">
								₹{previewTotal}
							</p>
						</div>
					)}

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
								disabled={disabled || createPending || updatePending}
								className="h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-primary"
							/>
						</label>
					</div>
				</>
			)}
		</div>
	);
}

export function Step4Deposit({
	state,
	dispatch,
	mode,
	disabled,
	createPending,
	updatePending,
	depositAmount,
}: StepProps & { depositAmount: number }) {
	return (
		<div className="space-y-6">
			<p className="font-medium">4. Deposit verification</p>

			{mode === "edit" ? (
				<div className="space-y-3 rounded-lg border bg-muted/40 p-4">
					<div className="text-sm font-medium">Caution Deposit Status</div>
					<div className="text-sm text-muted-foreground">
						Deposit was verified during check-in.
					</div>
					<div className="text-base font-semibold text-emerald-600">
						₹{depositAmount} — Already Paid
					</div>
				</div>
			) : (
				<>
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
								disabled={disabled || createPending || updatePending}
								className="h-4 w-4 cursor-pointer rounded focus:ring-2 focus:ring-primary"
							/>
						</label>
					</div>
				</>
			)}
		</div>
	);
}

export function Step5Room({
	state,
	dispatch,
	disabled,
	createPending,
	updatePending,
	hostelInputId,
	floorInputId,
}: StepProps & { hostelInputId: string; floorInputId: string }) {
	return (
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
					disabled={disabled || createPending || updatePending}
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
					disabled={disabled || createPending || updatePending}
					className="w-full rounded-md border border-border bg-background px-3 py-2"
				/>
			</div>
		</div>
	);
}

export function Step6Review({
	state,
	previewTotal,
	depositAmount,
	totalPayable,
}: {
	state: CheckInState;
	previewTotal: number;
	depositAmount: number;
	totalPayable: number;
}) {
	return (
		<div className="mx-auto max-w-2xl space-y-8">
			<p className="font-medium">6. Detailed review</p>
			{state.accommodationRequired === false ? (
				<div className="rounded-xl border bg-muted/40 p-6 text-center">
					<p className="text-lg font-semibold">No Accommodation Requested</p>
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
							<span className="text-muted-foreground">Nights Requested</span>
							<span className="text-right font-medium">
								{state.nightsRequested}
							</span>
						</div>
					</div>

					<div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
						<h5 className="text-sm font-semibold">Financial Summary</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span className="text-muted-foreground">Room Fee</span>
							<span className="text-right font-medium">₹{previewTotal}</span>
							<span className="text-muted-foreground">Caution Deposit</span>
							<span className="text-right font-medium">₹{depositAmount}</span>
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
							<span className="text-right font-medium">{state.hostelName}</span>
							<span className="text-muted-foreground">Floor</span>
							<span className="text-right font-medium">{state.floor}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export function Step7Confirm({
	state,
	previewTotal,
	depositAmount,
}: {
	state: CheckInState;
	previewTotal: number;
	depositAmount: number;
}) {
	return (
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
	);
}
