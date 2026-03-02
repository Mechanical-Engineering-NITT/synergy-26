import { AlertTriangle, Bed, ShieldCheck } from "lucide-react";
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				1. Accommodation required
			</p>
			<div
				role="radiogroup"
				aria-label="Accommodation required"
				className="space-y-2"
			>
				<label className="flex items-center gap-2 text-sm text-[#a1a1aa]">
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
						className="accent-white"
					/>
					<span>Yes</span>
				</label>
				<label className="flex items-center gap-2 text-sm text-[#a1a1aa]">
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
						className="accent-white"
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				2. Nights requested
			</p>
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
				className="w-full rounded-[10px] border border-[#222222] bg-[#0f0f0f] px-3 py-2 text-[#fafafa] transition-all duration-200"
			/>
			{state.accommodationRequired && state.nightsRequested <= 0 ? (
				<p className="text-xs text-[#71717a]">Enter nights greater than 0.</p>
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<ShieldCheck
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				3. Payment verification
			</p>

			{mode === "edit" && isFeeUnchanged ? (
				<div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
					<div className="text-sm font-medium">
						Accommodation Payment Status
					</div>
					<div className="text-xs text-[#71717a]">
						Accommodation fee was verified during check-in.
					</div>
					<div className="border-l-[3px] border-l-[#22c55e] pl-2 text-base font-semibold text-[#22c55e]">
						₹{state.originalAccommodationFee} — Already Paid
					</div>
				</div>
			) : (
				<>
					{mode === "edit" ? (
						<div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
							<div className="text-xs text-[#71717a]">
								Previous Accommodation Fee
							</div>
							<div className="text-lg text-[#52525b] line-through">
								₹{state.originalAccommodationFee}
							</div>
							<div className="text-sm font-medium">
								Updated Accommodation Fee
							</div>
							<div className="text-[28px] font-bold text-[#fafafa]">
								₹{state.accommodationPreviewTotal}
							</div>
							<div className="inline-flex items-center border-l-[3px] border-l-[#eab308] pl-2 text-sm text-[#eab308]">
								<AlertTriangle size={16} strokeWidth={1.5} className="mr-2" />
								To Pay: ₹{state.remainingToPay}
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
							<p className="text-sm text-[#22c55e]">Total Accommodation Fee</p>
							<p className="text-[28px] font-bold text-[#fafafa]">
								₹{previewTotal}
							</p>
						</div>
					)}

					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div>
							<p className="font-medium">
								Confirm Accommodation Payment Received
							</p>
							<p className="text-xs text-[#71717a]">
								Verify that the full amount has been paid.
							</p>
						</div>

						<label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[#a1a1aa]">
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
								className="accent-white"
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<ShieldCheck
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				4. Deposit verification
			</p>

			{mode === "edit" ? (
				<div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
					<div className="text-sm font-medium">Caution Deposit Status</div>
					<div className="text-xs text-[#71717a]">
						Deposit was verified during check-in.
					</div>
					<div className="border-l-[3px] border-l-[#22c55e] pl-2 text-base font-semibold text-[#22c55e]">
						₹{depositAmount} — Already Paid
					</div>
				</div>
			) : (
				<>
					<div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
						<p className="text-sm text-[#22c55e]">Caution Deposit Amount</p>
						<p className="text-[28px] font-bold text-[#fafafa]">
							₹{depositAmount}
						</p>
					</div>

					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div>
							<p className="font-medium">Confirm Caution Deposit Received</p>
							<p className="text-xs text-[#71717a]">
								Verify that the caution deposit has been collected.
							</p>
						</div>

						<label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[#a1a1aa]">
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
								className="accent-white"
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				5. Room allotment
			</p>
			<div className="space-y-2">
				<label htmlFor={hostelInputId} className="block text-xs text-[#a1a1aa]">
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
					className="w-full rounded-[10px] border border-[#222222] bg-[#0f0f0f] px-3 py-2 text-[#fafafa] transition-all duration-200"
				/>

				<label htmlFor={floorInputId} className="block text-xs text-[#a1a1aa]">
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
					className="w-full rounded-[10px] border border-[#222222] bg-[#0f0f0f] px-3 py-2 text-[#fafafa] transition-all duration-200"
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
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				6. Detailed review
			</p>
			{state.accommodationRequired === false ? (
				<div className="rounded-xl border border-[#222222] bg-[#141414] p-6 text-center">
					<p className="text-lg font-semibold">No Accommodation Requested</p>
					<p className="mt-2 text-xs text-[#71717a]">
						No room assigned and no charges applicable.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
						<h5 className="text-sm font-semibold">Stay Overview</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span className="text-[#a1a1aa]">Accommodation</span>
							<span className="text-right font-medium text-[#fafafa]">Yes</span>
							<span className="text-[#a1a1aa]">Nights Requested</span>
							<span className="text-right font-medium text-[#fafafa]">
								{state.nightsRequested}
							</span>
						</div>
					</div>

					<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
						<h5 className="text-sm font-semibold">Financial Summary</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span className="text-[#a1a1aa]">Room Fee</span>
							<span className="text-right font-medium text-[#fafafa]">
								₹{previewTotal}
							</span>
							<span className="text-[#a1a1aa]">Caution Deposit</span>
							<span className="text-right font-medium text-[#fafafa]">
								₹{depositAmount}
							</span>
						</div>
						<div className="flex justify-between border-t border-[#1f1f1f] pt-3 text-base font-semibold">
							<span>Total Payable</span>
							<span className="text-[#fafafa]">₹{totalPayable}</span>
						</div>
					</div>

					<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
						<h5 className="text-sm font-semibold">Room Allotment</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span className="text-[#a1a1aa]">Hostel</span>
							<span className="text-right font-medium text-[#fafafa]">
								{state.hostelName}
							</span>
							<span className="text-[#a1a1aa]">Floor</span>
							<span className="text-right font-medium text-[#fafafa]">
								{state.floor}
							</span>
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
			<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-8 text-center">
				<h5 className="inline-flex items-center text-base font-medium text-[#fafafa]">
					<Bed size={20} strokeWidth={1.5} color="#71717a" className="mr-2" />
					Confirm Check-In
				</h5>

				{state.accommodationRequired === false ? (
					<p className="text-sm text-[#94a3b8]">No accommodation requested.</p>
				) : (
					<div className="space-y-3">
						<div className="text-[28px] font-bold text-[#fafafa]">
							₹{previewTotal}
						</div>
						<p className="text-xs text-[#71717a]">
							Accommodation fee confirmed.
						</p>
						<p className="text-sm text-[#a1a1aa]">
							Caution deposit: ₹{depositAmount}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
