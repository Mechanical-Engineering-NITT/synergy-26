import { AlertTriangle, Bed, ShieldCheck } from "lucide-react";
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
		<div className="space-y-3 rounded-xl border border-[#222222] bg-[#141414] p-6 text-center transition-all duration-200">
			<p className="inline-flex items-center justify-center text-base font-medium text-[#fafafa]">
				<Bed size={20} strokeWidth={1.5} color="#71717a" className="mr-2" />
				No Accommodation Stay
			</p>
			<p className="text-xs text-[#71717a]">
				This user did not request accommodation.
			</p>
			<p className="text-xs text-[#71717a]">
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				2. Detailed review
			</p>

			<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-[#a1a1aa]">Check-In Timestamp</span>
					<span className="text-right font-medium text-[#fafafa]">
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span className="text-[#a1a1aa]">Check-Out</span>
					<span className="text-right font-medium text-[#fafafa]">Pending</span>
					<span className="text-[#94a3b8]">Accommodation</span>
					<span className="text-right font-medium text-[#e2e8f0]">
						Not Requested
					</span>
					<span className="text-[#94a3b8]">Charges</span>
					<span className="text-right font-medium text-[#e2e8f0]">₹0</span>
					<span className="text-[#94a3b8]">Deposit</span>
					<span className="text-right font-medium text-[#e2e8f0]">
						Not Applicable
					</span>
					<span className="text-[#94a3b8]">Fine</span>
					<span className="text-right font-medium text-[#e2e8f0]">
						Not Applicable
					</span>
				</div>
			</div>
		</div>
	);
}

export function Step3NoAccommodationConfirm() {
	return (
		<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-8 text-center">
			<p className="text-xl font-semibold">Confirm Check-Out</p>
			<p className="text-base text-[#a1a1aa]">
				No accommodation was requested.
			</p>
			<p className="text-xs text-[#71717a]">No charges or deposits involved.</p>
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				1. Overstay status
			</p>
			{isDetailsLoading ? (
				<p className="text-xs text-[#71717a]">Loading stay details...</p>
			) : null}
			{isDetailsError ? (
				<p className="text-xs text-[#71717a]">
					{detailsError instanceof Error
						? detailsError.message
						: "Failed to load stay details."}
				</p>
			) : null}
			{!isDetailsLoading && !isDetailsError ? (
				<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-8 text-center">
					{overstayed ? (
						<div className="border-l-[3px] border-l-[#ef4444] bg-transparent p-2 pl-3 text-sm text-[#ef4444]">
							User has overstayed. Edit Check-In to adjust nights and fee.
						</div>
					) : null}

					{overstayed ? (
						<>
							<h5 className="text-2xl font-semibold">Overstay Detected</h5>
							<div className="text-3xl font-bold text-[#ef4444]">
								{overstayDays} Extra Days
							</div>
							<p className="text-xs text-[#71717a]">
								User has exceeded approved stay duration.
							</p>
						</>
					) : (
						<>
							<h5 className="text-2xl font-semibold">Stay Within Limit</h5>
							<div className="text-3xl font-bold text-[#22c55e]">
								No Overstay
							</div>
							<p className="text-xs text-[#71717a]">
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				2. Fine applicable?
			</p>
			<div role="radiogroup" aria-label="Fine applicable" className="space-y-2">
				<label className="flex items-center gap-2 text-[#a1a1aa]">
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
						className="accent-white"
					/>
					<span>Yes</span>
				</label>
				<label className="flex items-center gap-2 text-[#a1a1aa]">
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
						className="accent-white"
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
		<div className="space-y-2 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				3. Set fine amount
			</p>
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
				className="w-full rounded-[10px] border border-[#222222] bg-[#0f0f0f] px-3 py-2 text-[#fafafa] transition-all duration-200"
			/>
			{state.fineApplicable === true && state.fineAmount <= 0 ? (
				<p className="text-xs text-[#71717a]">
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				4. Fine paid verification
			</p>

			<div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
				<div className="text-sm font-medium">Fine Amount</div>
				<div className="text-[28px] font-bold text-[#fafafa]">
					₹{state.fineAmount}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Fine Paid</p>
				<label className="flex items-center gap-2 text-[#a1a1aa]">
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
						className="accent-white"
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<ShieldCheck
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					className="mr-2"
				/>
				5. Deposit return verification
			</p>

			<div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-4">
				<p className="text-xs text-[#71717a]">Caution Deposit to Return</p>
				<p className="text-[28px] font-bold text-[#fafafa]">
					₹{cautionDeposit}
				</p>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Deposit Returned</p>
				<label className="flex items-center gap-2 text-[#a1a1aa]">
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
						className="accent-white"
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
		<div className="space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-5 transition-all duration-200">
			<p className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={18} strokeWidth={1.5} color="#71717a" className="mr-2" />
				6. Detailed review
			</p>

			<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-[#a1a1aa]">Checked In At</span>
					<span className="text-right font-medium text-[#fafafa]">
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span className="text-[#a1a1aa]">Checked Out At</span>
					<span className="text-right font-medium text-[#fafafa]">Pending</span>
					<span className="text-[#a1a1aa]">Elapsed Days</span>
					<span className="text-right font-medium text-[#fafafa]">
						{elapsedDays}
					</span>
				</div>
			</div>

			<div className="space-y-4 rounded-xl border border-[#222222] bg-[#141414] p-5">
				<h5 className="text-sm font-semibold">Financial Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-[#a1a1aa]">Fine Applicable</span>
					<span className="text-right font-medium text-[#fafafa]">
						{state.fineApplicable ? "Yes" : "No"}
					</span>
					<span className="text-[#a1a1aa]">Fine Applied</span>
					<span className="text-right font-semibold text-[#fafafa]">
						₹{state.fineAmount}
					</span>
					{state.fineApplicable === true ? (
						<>
							<span className="text-[#a1a1aa]">Fine Paid</span>
							<span className="text-right font-medium text-[#22c55e]">Yes</span>
						</>
					) : null}
					<span className="text-[#a1a1aa]">Deposit Returned</span>
					<span className="text-right font-medium text-[#fafafa]">
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
		<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-[#222222] bg-[#141414] p-8 text-center">
			<h5 className="inline-flex items-center text-base font-medium text-[#fafafa]">
				<Bed size={20} strokeWidth={1.5} color="#71717a" className="mr-2" />
				Confirm Check-Out
			</h5>
			{state.fineApplicable === true ? (
				<>
					<div className="text-base font-medium text-[#a1a1aa]">
						Fine Applied: ₹{state.fineAmount}
					</div>
					<div className="text-xs text-[#71717a]">Fine Paid Confirmed</div>
					<p className="text-sm text-[#ef4444]">Deposit Retained</p>
				</>
			) : (
				<>
					<div className="text-3xl font-bold text-[#22c55e]">
						No Fine Applied
					</div>
					<p className="text-xs text-[#71717a]">Deposit Returned: Yes</p>
				</>
			)}
		</div>
	);
}
