import { AlertTriangle, Calendar, ShieldCheck, Wallet } from "lucide-react";
import type { StayFullDetails } from "../types";

export function StatusPanel({
	stayData,
}: {
	stayData: StayFullDetails | null;
}) {
	const formatDate = (value: Date | null) =>
		value ? new Date(value).toLocaleString() : null;

	if (!stayData?.exists) {
		return (
			<div
				className="rounded-lg p-6"
				style={{
					backgroundColor: "#141414",
					border: "1px solid #222222",
					color: "#71717a",
					fontSize: "14px",
				}}
			>
				No active stay.
			</div>
		);
	}

	const isStayActive = !!stayData.checkedInAt && !stayData.checkedOutAt;
	const isNoAccommodation = !stayData.accommodationRequired;
	const hasFineApplied = stayData.fineAmount > 0;

	return (
		<div
			className="rounded-xl p-5"
			style={{
				backgroundColor: "#141414",
				border: "1px solid #222222",
				color: "#fafafa",
				transition: "all 0.2s ease",
			}}
		>
			<div
				style={{
					borderBottom: "1px solid #1f1f1f",
					paddingBottom: "16px",
					marginBottom: "16px",
				}}
			>
				<h3
					className="inline-flex items-center"
					style={{
						fontSize: "16px",
						fontWeight: 500,
						gap: "8px",
						marginBottom: "10px",
					}}
				>
					<Calendar size={16} color="#71717a" strokeWidth={1.5} />
					Stay Timeline
				</h3>
				<div className="grid grid-cols-2 gap-y-2" style={{ fontSize: "14px" }}>
					<span style={{ color: "#a1a1aa" }}>Check-In</span>
					<span className="text-right" style={{ color: "#fafafa" }}>
						{formatDate(stayData.checkedInAt) ?? "N/A"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Check-Out</span>
					<span className="text-right" style={{ color: "#fafafa" }}>
						{formatDate(stayData.checkedOutAt) ?? "Pending"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Elapsed Days</span>
					<span className="text-right">{stayData.elapsedDays}</span>
					<span style={{ color: "#a1a1aa" }}>Nights Requested</span>
					<span className="text-right">{stayData.nightsRequested}</span>
					<span style={{ color: "#a1a1aa" }}>Stay State</span>
					<span className="text-right">
						{isStayActive ? "Active Stay" : "Completed"}
					</span>
				</div>
			</div>

			<div
				style={{
					borderBottom: "1px solid #1f1f1f",
					paddingBottom: "16px",
					marginBottom: "16px",
				}}
			>
				<h3
					className="inline-flex items-center"
					style={{
						fontSize: "16px",
						fontWeight: 500,
						gap: "8px",
						marginBottom: "10px",
					}}
				>
					<Wallet size={16} color="#71717a" strokeWidth={1.5} />
					Financial
				</h3>
				<div className="grid grid-cols-2 gap-y-2" style={{ fontSize: "14px" }}>
					<span style={{ color: "#a1a1aa" }}>Accommodation</span>
					<span className="text-right">
						{isNoAccommodation ? "Not Requested" : "Requested"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Accommodation Fee</span>
					<span className="text-right">
						₹{isNoAccommodation ? 0 : stayData.accommodationFee}
					</span>
					<span style={{ color: "#a1a1aa" }}>Caution Deposit</span>
					<span className="text-right">
						{isNoAccommodation
							? "Not Applicable"
							: `₹${stayData.cautionDeposit}`}
					</span>
					<span style={{ color: "#a1a1aa" }}>Fine</span>
					<span className="text-right">
						{isNoAccommodation ? "Not Applicable" : `₹${stayData.fineAmount}`}
					</span>
				</div>
			</div>

			<div
				style={{
					borderBottom: "1px solid #1f1f1f",
					paddingBottom: "16px",
					marginBottom: "16px",
				}}
			>
				<h3
					className="inline-flex items-center"
					style={{
						fontSize: "16px",
						fontWeight: 500,
						gap: "8px",
						marginBottom: "10px",
					}}
				>
					<ShieldCheck size={16} color="#71717a" strokeWidth={1.5} />
					Status
				</h3>
				<div className="grid grid-cols-2 gap-y-2" style={{ fontSize: "14px" }}>
					<span style={{ color: "#a1a1aa" }}>Fine Applied</span>
					<span className="text-right">{hasFineApplied ? "Yes" : "No"}</span>
					<span style={{ color: "#a1a1aa" }}>Fine Paid</span>
					<span
						className="text-right"
						style={{ color: stayData.finePaid ? "#22c55e" : "#eab308" }}
					>
						{hasFineApplied
							? stayData.finePaid
								? "Yes"
								: "No"
							: "Not Applicable"}
					</span>
					<span style={{ color: "#a1a1aa" }}>Deposit Returned</span>
					<span
						className="text-right"
						style={{ color: stayData.cautionReturned ? "#22c55e" : "#eab308" }}
					>
						{hasFineApplied
							? "No (Retained)"
							: stayData.cautionReturned
								? "Yes"
								: "No"}
					</span>
				</div>
			</div>

			{stayData.checkedOutAt ? (
				<p style={{ color: "#a1a1aa", fontSize: "14px" }}>Stay Completed</p>
			) : !isNoAccommodation && stayData.overstayed ? (
				<div
					style={{
						borderLeft: "3px solid #ef4444",
						paddingLeft: "12px",
						color: "#ef4444",
						fontSize: "14px",
					}}
				>
					<p className="inline-flex items-center" style={{ gap: "8px" }}>
						<AlertTriangle size={16} color="#71717a" strokeWidth={1.5} />
						Overstay Detected
					</p>
					<p style={{ color: "#71717a", fontSize: "12px" }}>
						Elapsed days exceed approved stay.
					</p>
				</div>
			) : (
				<div
					style={{
						borderLeft: "3px solid #22c55e",
						paddingLeft: "12px",
						color: "#22c55e",
						fontSize: "14px",
					}}
				>
					Stay Within Approved Duration
				</div>
			)}
		</div>
	);
}
