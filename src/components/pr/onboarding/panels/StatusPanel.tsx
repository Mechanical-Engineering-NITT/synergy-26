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
			<div className="mx-auto max-w-3xl">
				<div className="rounded-lg border bg-muted/40 p-6 text-center">
					<p className="text-sm text-muted-foreground">No active stay.</p>
				</div>
			</div>
		);
	}

	const isStayActive = !!stayData.checkedInAt && !stayData.checkedOutAt;
	const isNoAccommodation = !stayData.accommodationRequired;
	const hasFineApplied = stayData.fineAmount > 0;

	return (
		<div className="mx-auto max-h-[45vh] max-w-3xl space-y-8 overflow-y-auto pr-1">
			<div className="space-y-6 rounded-xl border bg-card p-5 shadow-sm">
				<h3 className="text-sm font-semibold">Stay Timeline</h3>
				<div className="grid grid-cols-2 gap-y-3 text-sm">
					<span className="text-muted-foreground">Check-In</span>
					<span className="text-right font-medium">
						{formatDate(stayData.checkedInAt) ?? "N/A"}
					</span>
					<span className="text-muted-foreground">Check-Out</span>
					<span className="text-right font-medium">
						{formatDate(stayData.checkedOutAt) ?? "Pending"}
					</span>
					<span className="text-muted-foreground">Elapsed Days</span>
					<span className="text-right font-medium">{stayData.elapsedDays}</span>
					<span className="text-muted-foreground">Nights Requested</span>
					<span className="text-right font-medium">
						{stayData.nightsRequested}
					</span>
					<span className="text-muted-foreground">Stay State</span>
					<span className="text-right font-medium">
						{isStayActive ? "Active Stay" : "Completed"}
					</span>
				</div>
			</div>

			<div className="space-y-6 rounded-xl border bg-card p-5 shadow-sm">
				<h3 className="text-sm font-semibold">Accommodation Summary</h3>
				{isNoAccommodation ? (
					<div className="grid grid-cols-2 gap-y-3 text-sm">
						<span className="text-muted-foreground">Accommodation</span>
						<span className="text-right font-medium">Not Requested</span>
						<span className="text-muted-foreground">Accommodation Fee</span>
						<span className="text-right font-medium">₹0</span>
						<span className="text-muted-foreground">Deposit</span>
						<span className="text-right font-medium">Not Applicable</span>
						<span className="text-muted-foreground">Fine</span>
						<span className="text-right font-medium">Not Applicable</span>
					</div>
				) : stayData.accommodationRequired ? (
					<div className="grid grid-cols-2 gap-y-3 text-sm">
						<span className="text-muted-foreground">Accommodation Fee</span>
						<span className="text-right font-medium">
							₹{stayData.accommodationFee}
						</span>
						<span className="text-muted-foreground">Caution Deposit</span>
						<span className="text-right font-medium">
							₹{stayData.cautionDeposit}
						</span>
						<span className="text-muted-foreground">Total Amount Paid</span>
						<span className="text-right font-medium">
							₹{stayData.accommodationFee + stayData.cautionDeposit}
						</span>
					</div>
				) : (
					<div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
						No accommodation requested.
					</div>
				)}
			</div>

			{isNoAccommodation ? (
				<div className="bg-muted/40 border rounded-lg p-4 text-center">
					<p className="font-medium">No Financial Activity for This Stay</p>
				</div>
			) : (
				<div className="space-y-6 rounded-xl border bg-card p-5 shadow-sm">
					<h3 className="text-sm font-semibold">Deposit & Fine Status</h3>
					<div className="grid grid-cols-2 gap-y-3 text-sm">
						<span className="text-muted-foreground">Fine Applied</span>
						<span className="text-right font-medium">
							{hasFineApplied ? "Yes" : "No"}
						</span>
						{hasFineApplied ? (
							<>
								<span className="text-muted-foreground">Fine Amount</span>
								<span className="text-right font-medium">
									₹{stayData.fineAmount}
								</span>
								<span className="text-muted-foreground">Fine Paid</span>
								<span
									className={`text-right font-medium ${
										stayData.finePaid ? "text-emerald-600" : "text-yellow-600"
									}`}
								>
									{stayData.finePaid ? "Yes" : "No"}
								</span>
								<span className="text-muted-foreground">Deposit Status</span>
								<span className="text-right font-medium text-red-600">
									Retained
								</span>
							</>
						) : (
							<>
								<span className="text-muted-foreground">Deposit Returned</span>
								<span
									className={`text-right font-medium ${
										stayData.cautionReturned
											? "text-emerald-600"
											: "text-yellow-600"
									}`}
								>
									{stayData.cautionReturned ? "Yes" : "No"}
								</span>
							</>
						)}
					</div>
				</div>
			)}

			{stayData.checkedOutAt ? (
				<div className="rounded-lg border bg-muted/40 p-4 text-center">
					<p className="font-semibold">Stay Completed</p>
				</div>
			) : !isNoAccommodation && stayData.overstayed ? (
				<div className="rounded-lg border border-red-400 bg-red-100 p-4 text-center">
					<p className="font-semibold text-red-700">Overstay Detected</p>
					<p className="text-sm text-red-600">
						Elapsed days exceed approved stay.
					</p>
				</div>
			) : (
				<div className="rounded-lg border border-emerald-400 bg-emerald-100 p-4 text-center">
					<p className="font-semibold text-emerald-700">
						Stay Within Approved Duration
					</p>
				</div>
			)}
		</div>
	);
}
