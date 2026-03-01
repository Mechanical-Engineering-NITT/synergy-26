import { useEffect, useState } from "react";
import { CheckInWizard } from "../checkin";
import { CheckOutWizard } from "../checkout";
import type { CheckInMode, StayFullDetails } from "../types";

export function ControlsPanel({
	userId,
	stayData,
	onActionComplete,
	checkInResetSignal,
	checkOutResetSignal,
}: {
	userId: string;
	stayData: StayFullDetails;
	onActionComplete: () => Promise<void>;
	checkInResetSignal: number;
	checkOutResetSignal: number;
}) {
	const hasNoRecord = !stayData.exists;
	const checkInMode: CheckInMode = stayData.exists ? "edit" : "create";
	const checkOutMode: "create" | "edit" = stayData.exists ? "edit" : "create";
	const checkInTabLabel = stayData.exists ? "Edit Check-In" : "Check-In";
	const checkOutTabLabel = stayData.checkedOutAt
		? "Edit Check-Out"
		: "Check-Out";
	const [activeWizardTab, setActiveWizardTab] = useState<
		"checkin" | "checkout"
	>(stayData.checkedInAt ? "checkout" : "checkin");

	const checkoutDisabled = !stayData.exists || !stayData.checkedInAt;

	useEffect(() => {
		if (checkoutDisabled && activeWizardTab === "checkout") {
			setActiveWizardTab("checkin");
		}
	}, [checkoutDisabled, activeWizardTab]);

	useEffect(() => {
		setActiveWizardTab(stayData.checkedInAt ? "checkout" : "checkin");
	}, [stayData.checkedInAt]);

	const isCheckInDisabled = false;
	const isCheckOutDisabled = hasNoRecord;
	const checkInStayKey = stayData.updatedAt
		? new Date(stayData.updatedAt).toISOString()
		: stayData.checkedInAt
			? new Date(stayData.checkedInAt).toISOString()
			: "new";
	const checkOutStayKey = stayData.checkedOutAt
		? new Date(stayData.checkedOutAt).toISOString()
		: stayData.updatedAt
			? new Date(stayData.updatedAt).toISOString()
			: stayData.checkedInAt
				? new Date(stayData.checkedInAt).toISOString()
				: "new";

	return (
		<div className="space-y-3 rounded-md border border-border bg-card p-4">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {
						setActiveWizardTab("checkin");
					}}
					className={`rounded-md px-3 py-1.5 text-sm ${
						activeWizardTab === "checkin"
							? "bg-primary text-primary-foreground"
							: "border border-border hover:bg-muted"
					}`}
				>
					{checkInTabLabel}
				</button>

				<button
					type="button"
					onClick={() => {
						if (!checkoutDisabled) {
							setActiveWizardTab("checkout");
						}
					}}
					disabled={checkoutDisabled}
					title={
						checkoutDisabled ? "User must complete check-in first" : undefined
					}
					className={`rounded-md px-3 py-1.5 text-sm ${
						activeWizardTab === "checkout"
							? "bg-primary text-primary-foreground"
							: "border border-border hover:bg-muted"
					} ${checkoutDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					{checkOutTabLabel}
				</button>
			</div>

			{activeWizardTab === "checkin" ? (
				<CheckInWizard
					key={`check-in-${userId}-${checkInMode}-${checkInStayKey}-${checkInResetSignal}`}
					userId={userId}
					stay={stayData}
					mode={checkInMode}
					disabled={isCheckInDisabled}
					onComplete={onActionComplete}
				/>
			) : null}

			{activeWizardTab === "checkout" ? (
				<CheckOutWizard
					key={`check-out-${userId}-${checkOutMode}-${checkOutStayKey}-${checkOutResetSignal}`}
					userId={userId}
					stay={stayData}
					mode={checkOutMode}
					disabled={isCheckOutDisabled}
					onComplete={onActionComplete}
				/>
			) : null}
		</div>
	);
}
