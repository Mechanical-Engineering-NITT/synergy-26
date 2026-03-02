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
			<div className="rounded-lg border border-[#222222] bg-[#141414] p-6 text-sm text-[#71717a]">
				No active stay.
			</div>
		);
	}

	const isStayActive = !!stayData.checkedInAt && !stayData.checkedOutAt;
	const isNoAccommodation = !stayData.accommodationRequired;
	const hasFineApplied = stayData.fineAmount > 0;

	return (
		<div className="rounded-xl border border-[#222222] bg-[#141414] p-5 text-[#fafafa] transition-all duration-200">
			<div className="mb-4 border-b border-[#1f1f1f] pb-4">
				<h3 className="mb-2.5 inline-flex items-center gap-2 text-base font-medium">
					<Calendar size={16} color="#71717a" strokeWidth={1.5} />
					Stay Timeline
				</h3>
				<div className="grid grid-cols-2 gap-y-2 text-sm">
					<span className="text-[#a1a1aa]">Check-In</span>
					<span className="text-right text-[#fafafa]">
						{formatDate(stayData.checkedInAt) ?? "N/A"}
					</span>
					<span className="text-[#a1a1aa]">Check-Out</span>
					<span className="text-right text-[#fafafa]">
						{formatDate(stayData.checkedOutAt) ?? "Pending"}
					</span>
					<span className="text-[#a1a1aa]">Elapsed Days</span>
					<span className="text-right">{stayData.elapsedDays}</span>
					<span className="text-[#a1a1aa]">Nights Requested</span>
					<span className="text-right">{stayData.nightsRequested}</span>
					<span className="text-[#a1a1aa]">Stay State</span>
					<span className="text-right">
						{isStayActive ? "Active Stay" : "Completed"}
					</span>
				</div>
			</div>

			<div className="mb-4 border-b border-[#1f1f1f] pb-4">
				<h3 className="mb-2.5 inline-flex items-center gap-2 text-base font-medium">
					<Wallet size={16} color="#71717a" strokeWidth={1.5} />
					Financial
				</h3>
				<div className="grid grid-cols-2 gap-y-2 text-sm">
					<span className="text-[#a1a1aa]">Accommodation</span>
					<span className="text-right">
						{isNoAccommodation ? "Not Requested" : "Requested"}
					</span>
					<span className="text-[#a1a1aa]">Accommodation Fee</span>
					<span className="text-right">
						₹{isNoAccommodation ? 0 : stayData.accommodationFee}
					</span>
					<span className="text-[#a1a1aa]">Caution Deposit</span>
					<span className="text-right">
						{isNoAccommodation
							? "Not Applicable"
							: `₹${stayData.cautionDeposit}`}
					</span>
					<span className="text-[#a1a1aa]">Fine</span>
					<span className="text-right">
						{isNoAccommodation ? "Not Applicable" : `₹${stayData.fineAmount}`}
					</span>
				</div>
			</div>

			<div className="mb-4 border-b border-[#1f1f1f] pb-4">
				<h3 className="mb-2.5 inline-flex items-center gap-2 text-base font-medium">
					<ShieldCheck size={16} color="#71717a" strokeWidth={1.5} />
					Status
				</h3>
				<div className="grid grid-cols-2 gap-y-2 text-sm">
					<span className="text-[#a1a1aa]">Fine Applied</span>
					<span className="text-right">{hasFineApplied ? "Yes" : "No"}</span>
					<span className="text-[#a1a1aa]">Fine Paid</span>
					<span
						className={`text-right ${stayData.finePaid ? "text-[#22c55e]" : "text-[#eab308]"}`}
					>
						{hasFineApplied
							? stayData.finePaid
								? "Yes"
								: "No"
							: "Not Applicable"}
					</span>
					<span className="text-[#a1a1aa]">Deposit Returned</span>
					<span
						className={`text-right ${stayData.cautionReturned ? "text-[#22c55e]" : "text-[#eab308]"}`}
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
				<p className="text-sm text-[#a1a1aa]">Stay Completed</p>
			) : !isNoAccommodation && stayData.overstayed ? (
				<div className="border-l-[3px] border-l-[#ef4444] pl-3 text-sm text-[#ef4444]">
					<p className="inline-flex items-center gap-2">
						<AlertTriangle size={16} color="#71717a" strokeWidth={1.5} />
						Overstay Detected
					</p>
					<p className="text-xs text-[#71717a]">
						Elapsed days exceed approved stay.
					</p>
				</div>
			) : (
				<div className="border-l-[3px] border-l-[#22c55e] pl-3 text-sm text-[#22c55e]">
					Stay Within Approved Duration
				</div>
			)}
		</div>
	);
}
