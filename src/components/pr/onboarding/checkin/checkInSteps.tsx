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
				<Bed
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				1. Accommodation required
			</p>
			<div
				role="radiogroup"
				aria-label="Accommodation required"
				className="space-y-2"
			>
				<label
					className="flex items-center gap-2"
					style={{ color: "#a1a1aa", fontSize: "14px" }}
				>
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
						style={{ accentColor: "#ffffff" }}
					/>
					<span>Yes</span>
				</label>
				<label
					className="flex items-center gap-2"
					style={{ color: "#a1a1aa", fontSize: "14px" }}
				>
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
						style={{ accentColor: "#ffffff" }}
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
				<Bed
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
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
			{state.accommodationRequired && state.nightsRequested <= 0 ? (
				<p style={{ fontSize: "12px", color: "#71717a" }}>
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
				3. Payment verification
			</p>

			{mode === "edit" && isFeeUnchanged ? (
				<div
					className="space-y-3 rounded-lg p-4"
					style={{
						backgroundColor: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					<div className="text-sm font-medium">
						Accommodation Payment Status
					</div>
					<div style={{ fontSize: "12px", color: "#71717a" }}>
						Accommodation fee was verified during check-in.
					</div>
					<div
						className="text-base font-semibold"
						style={{
							color: "#22c55e",
							borderLeft: "3px solid #22c55e",
							paddingLeft: "8px",
						}}
					>
						₹{state.originalAccommodationFee} — Already Paid
					</div>
				</div>
			) : (
				<>
					{mode === "edit" ? (
						<div
							className="space-y-3 rounded-lg p-4"
							style={{
								backgroundColor: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<div style={{ fontSize: "12px", color: "#71717a" }}>
								Previous Accommodation Fee
							</div>
							<div
								className="text-lg line-through"
								style={{ color: "#52525b" }}
							>
								₹{state.originalAccommodationFee}
							</div>
							<div className="text-sm font-medium">
								Updated Accommodation Fee
							</div>
							<div
								className="font-bold"
								style={{ color: "#fafafa", fontSize: "28px" }}
							>
								₹{state.accommodationPreviewTotal}
							</div>
							<div
								className="inline-flex items-center text-sm"
								style={{
									color: "#eab308",
									borderLeft: "3px solid #eab308",
									paddingLeft: "8px",
								}}
							>
								<AlertTriangle
									size={16}
									strokeWidth={1.5}
									style={{ marginRight: "8px" }}
								/>
								To Pay: ₹{state.remainingToPay}
							</div>
						</div>
					) : (
						<div
							className="rounded-lg p-4"
							style={{
								backgroundColor: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<p className="text-sm" style={{ color: "#22c55e" }}>
								Total Accommodation Fee
							</p>
							<p
								className="font-bold"
								style={{ color: "#fafafa", fontSize: "28px" }}
							>
								₹{previewTotal}
							</p>
						</div>
					)}

					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div>
							<p className="font-medium">
								Confirm Accommodation Payment Received
							</p>
							<p style={{ fontSize: "12px", color: "#71717a" }}>
								Verify that the full amount has been paid.
							</p>
						</div>

						<label
							className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1"
							style={{ color: "#a1a1aa" }}
						>
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
								style={{ accentColor: "#ffffff" }}
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
				4. Deposit verification
			</p>

			{mode === "edit" ? (
				<div
					className="space-y-3 rounded-lg p-4"
					style={{
						backgroundColor: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					<div className="text-sm font-medium">Caution Deposit Status</div>
					<div style={{ fontSize: "12px", color: "#71717a" }}>
						Deposit was verified during check-in.
					</div>
					<div
						className="text-base font-semibold"
						style={{
							color: "#22c55e",
							borderLeft: "3px solid #22c55e",
							paddingLeft: "8px",
						}}
					>
						₹{depositAmount} — Already Paid
					</div>
				</div>
			) : (
				<>
					<div
						className="rounded-lg p-4"
						style={{
							backgroundColor: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
						}}
					>
						<p className="text-sm" style={{ color: "#22c55e" }}>
							Caution Deposit Amount
						</p>
						<p
							className="font-bold"
							style={{ color: "#fafafa", fontSize: "28px" }}
						>
							₹{depositAmount}
						</p>
					</div>

					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div>
							<p className="font-medium">Confirm Caution Deposit Received</p>
							<p style={{ fontSize: "12px", color: "#71717a" }}>
								Verify that the caution deposit has been collected.
							</p>
						</div>

						<label
							className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1"
							style={{ color: "#a1a1aa" }}
						>
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
								style={{ accentColor: "#ffffff" }}
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
				<Bed
					size={18}
					strokeWidth={1.5}
					color="#71717a"
					style={{ marginRight: "8px" }}
				/>
				5. Room allotment
			</p>
			<div className="space-y-2">
				<label
					htmlFor={hostelInputId}
					className="block text-xs"
					style={{ color: "#a1a1aa", fontSize: "12px" }}
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

				<label
					htmlFor={floorInputId}
					className="block text-xs"
					style={{ color: "#a1a1aa", fontSize: "12px" }}
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
			{state.accommodationRequired === false ? (
				<div
					className="rounded-xl p-6 text-center"
					style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
				>
					<p className="text-lg font-semibold">No Accommodation Requested</p>
					<p style={{ marginTop: "8px", fontSize: "12px", color: "#71717a" }}>
						No room assigned and no charges applicable.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					<div
						className="space-y-4 rounded-xl p-5"
						style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
					>
						<h5 className="text-sm font-semibold">Stay Overview</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span style={{ color: "#a1a1aa" }}>Accommodation</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
								Yes
							</span>
							<span style={{ color: "#a1a1aa" }}>Nights Requested</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
								{state.nightsRequested}
							</span>
						</div>
					</div>

					<div
						className="space-y-4 rounded-xl p-5"
						style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
					>
						<h5 className="text-sm font-semibold">Financial Summary</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span style={{ color: "#a1a1aa" }}>Room Fee</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
								₹{previewTotal}
							</span>
							<span style={{ color: "#a1a1aa" }}>Caution Deposit</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
								₹{depositAmount}
							</span>
						</div>
						<div
							className="flex justify-between pt-3 text-base font-semibold"
							style={{ borderTop: "1px solid #1f1f1f" }}
						>
							<span>Total Payable</span>
							<span style={{ color: "#fafafa" }}>₹{totalPayable}</span>
						</div>
					</div>

					<div
						className="space-y-4 rounded-xl p-5"
						style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
					>
						<h5 className="text-sm font-semibold">Room Allotment</h5>
						<div className="grid grid-cols-2 gap-y-3 text-sm">
							<span style={{ color: "#a1a1aa" }}>Hostel</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
								{state.hostelName}
							</span>
							<span style={{ color: "#a1a1aa" }}>Floor</span>
							<span
								className="text-right"
								style={{ color: "#fafafa", fontWeight: 500 }}
							>
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
					Confirm Check-In
				</h5>

				{state.accommodationRequired === false ? (
					<p className="text-sm" style={{ color: "#94a3b8" }}>
						No accommodation requested.
					</p>
				) : (
					<div className="space-y-3">
						<div
							className="font-bold"
							style={{ color: "#fafafa", fontSize: "28px" }}
						>
							₹{previewTotal}
						</div>
						<p style={{ fontSize: "12px", color: "#71717a" }}>
							Accommodation fee confirmed.
						</p>
						<p style={{ fontSize: "14px", color: "#a1a1aa" }}>
							Caution deposit: ₹{depositAmount}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
