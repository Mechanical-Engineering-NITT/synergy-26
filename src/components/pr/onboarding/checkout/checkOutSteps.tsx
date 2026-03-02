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
		<div
			className="space-y-3 rounded-xl p-6 text-center"
			style={{
				backgroundColor: "#141414",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center justify-center text-lg font-semibold"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<Bed
					size={20}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				No Accommodation Stay
			</p>
			<p style={{ fontSize: "12px", color: "#71717a" }}>
				This user did not request accommodation.
			</p>
			<p style={{ fontSize: "12px", color: "#71717a" }}>
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
		<div
			className="space-y-6"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<Bed
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				2. Detailed review
			</p>

			<div
				className="space-y-4 rounded-xl p-5"
				style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
			>
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span style={{ color: "#a1a1aa" }}>Check-In Timestamp</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Check-Out</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						Pending
					</span>
					<span style={{ color: "#94a3b8" }}>Accommodation</span>
					<span
						className="text-right"
						style={{ color: "#e2e8f0", fontWeight: 500 }}
					>
						Not Requested
					</span>
					<span style={{ color: "#94a3b8" }}>Charges</span>
					<span
						className="text-right"
						style={{ color: "#e2e8f0", fontWeight: 500 }}
					>
						₹0
					</span>
					<span style={{ color: "#94a3b8" }}>Deposit</span>
					<span
						className="text-right"
						style={{ color: "#e2e8f0", fontWeight: 500 }}
					>
						Not Applicable
					</span>
					<span style={{ color: "#94a3b8" }}>Fine</span>
					<span
						className="text-right"
						style={{ color: "#e2e8f0", fontWeight: 500 }}
					>
						Not Applicable
					</span>
				</div>
			</div>
		</div>
	);
}

export function Step3NoAccommodationConfirm() {
	return (
		<div
			className="mx-auto max-w-md space-y-6 rounded-2xl p-8 text-center"
			style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
		>
			<p className="text-xl font-semibold">Confirm Check-Out</p>
			<p className="text-base" style={{ color: "#a1a1aa" }}>
				No accommodation was requested.
			</p>
			<p style={{ fontSize: "12px", color: "#71717a" }}>
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
		<div
			className="space-y-2"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				1. Overstay status
			</p>
			{isDetailsLoading ? (
				<p style={{ color: "#71717a", fontSize: "12px" }}>
					Loading stay details...
				</p>
			) : null}
			{isDetailsError ? (
				<p style={{ color: "#71717a", fontSize: "12px" }}>
					{detailsError instanceof Error
						? detailsError.message
						: "Failed to load stay details."}
				</p>
			) : null}
			{!isDetailsLoading && !isDetailsError ? (
				<div
					className="mx-auto max-w-md space-y-6 rounded-2xl p-8 text-center"
					style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
				>
					{overstayed ? (
						<div
							className="p-2 text-sm"
							style={{
								backgroundColor: "transparent",
								color: "#ef4444",
								borderLeft: "3px solid #ef4444",
								paddingLeft: "12px",
							}}
						>
							User has overstayed. Edit Check-In to adjust nights and fee.
						</div>
					) : null}

					{overstayed ? (
						<>
							<h5 className="text-2xl font-semibold">Overstay Detected</h5>
							<div className="text-3xl font-bold" style={{ color: "#ef4444" }}>
								{overstayDays} Extra Days
							</div>
							<p style={{ fontSize: "12px", color: "#71717a" }}>
								User has exceeded approved stay duration.
							</p>
						</>
					) : (
						<>
							<h5 className="text-2xl font-semibold">Stay Within Limit</h5>
							<div className="text-3xl font-bold" style={{ color: "#22c55e" }}>
								No Overstay
							</div>
							<p style={{ fontSize: "12px", color: "#71717a" }}>
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
		<div
			className="space-y-2"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				2. Fine applicable?
			</p>
			<div role="radiogroup" aria-label="Fine applicable" className="space-y-2">
				<label className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
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
						style={{ accentColor: "#ffffff" }}
					/>
					<span>Yes</span>
				</label>
				<label className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
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
						style={{ accentColor: "#ffffff" }}
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
		<div
			className="space-y-2"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
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
				className="w-full"
				style={{
					backgroundColor: "#0f0f0f",
					border: "1px solid #222222",
					borderRadius: "10px",
					padding: "8px 12px",
					color: "#fafafa",
					transition: "all 0.2s ease",
				}}
			/>
			{state.fineApplicable === true && state.fineAmount <= 0 ? (
				<p style={{ fontSize: "12px", color: "#71717a" }}>
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
		<div
			className="space-y-6"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<AlertTriangle
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				4. Fine paid verification
			</p>

			<div
				className="space-y-3 rounded-lg p-4"
				style={{
					backgroundColor: "rgba(255,255,255,0.04)",
					border: "1px solid rgba(255,255,255,0.08)",
				}}
			>
				<div className="text-sm font-medium">Fine Amount</div>
				<div
					className="font-bold"
					style={{ color: "#fafafa", fontSize: "28px" }}
				>
					₹{state.fineAmount}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Fine Paid</p>
				<label className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
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
						style={{ accentColor: "#ffffff" }}
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
		<div
			className="space-y-6"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<ShieldCheck
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				5. Deposit return verification
			</p>

			<div
				className="rounded-lg p-4"
				style={{
					backgroundColor: "rgba(255,255,255,0.04)",
					border: "1px solid rgba(255,255,255,0.08)",
				}}
			>
				<p style={{ fontSize: "12px", color: "#71717a" }}>
					Caution Deposit to Return
				</p>
				<p className="font-bold" style={{ color: "#fafafa", fontSize: "28px" }}>
					₹{cautionDeposit}
				</p>
			</div>

			<div className="flex items-center justify-between gap-3">
				<p className="font-medium">Confirm Deposit Returned</p>
				<label className="flex items-center gap-2" style={{ color: "#a1a1aa" }}>
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
						style={{ accentColor: "#ffffff" }}
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
		<div
			className="space-y-6"
			style={{
				backgroundColor: "#141414",
				borderRadius: "16px",
				padding: "20px",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<p
				className="inline-flex items-center font-medium"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<Bed
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				6. Detailed review
			</p>

			<div
				className="space-y-4 rounded-xl p-5"
				style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
			>
				<h5 className="text-sm font-semibold">Stay Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span style={{ color: "#a1a1aa" }}>Checked In At</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						{checkedInAt ? new Date(checkedInAt).toLocaleString() : "N/A"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Checked Out At</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						Pending
					</span>
					<span style={{ color: "#a1a1aa" }}>Elapsed Days</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						{elapsedDays}
					</span>
				</div>
			</div>

			<div
				className="space-y-4 rounded-xl p-5"
				style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
			>
				<h5 className="text-sm font-semibold">Financial Summary</h5>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span style={{ color: "#a1a1aa" }}>Fine Applicable</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
						{state.fineApplicable ? "Yes" : "No"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Fine Applied</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 600 }}
					>
						₹{state.fineAmount}
					</span>
					{state.fineApplicable === true ? (
						<>
							<span style={{ color: "#a1a1aa" }}>Fine Paid</span>
							<span
								className="text-right"
								style={{ color: "#22c55e", fontWeight: 500 }}
							>
								Yes
							</span>
						</>
					) : null}
					<span style={{ color: "#a1a1aa" }}>Deposit Returned</span>
					<span
						className="text-right"
						style={{ color: "#fafafa", fontWeight: 500 }}
					>
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
		<div
			className="mx-auto max-w-md space-y-6 rounded-2xl p-8 text-center"
			style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
		>
			<h5
				className="inline-flex items-center text-2xl font-semibold"
				style={{ color: "#fafafa", fontSize: "16px", fontWeight: 500 }}
			>
				<Bed
					size={20}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				Confirm Check-Out
			</h5>
			{state.fineApplicable === true ? (
				<>
					<div className="text-base font-medium" style={{ color: "#a1a1aa" }}>
						Fine Applied: ₹{state.fineAmount}
					</div>
					<div style={{ fontSize: "12px", color: "#71717a" }}>
						Fine Paid Confirmed
					</div>
					<p className="text-sm" style={{ color: "#ef4444" }}>
						Deposit Retained
					</p>
				</>
			) : (
				<>
					<div
						className="text-3xl font-bold"
						style={{
							color: "#22c55e",
						}}
					>
						No Fine Applied
					</div>
					<p style={{ fontSize: "12px", color: "#71717a" }}>
						Deposit Returned: Yes
					</p>
				</>
			)}
		</div>
	);
}
