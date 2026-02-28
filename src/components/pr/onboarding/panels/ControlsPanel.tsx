import { useEffect, useState } from "react";
import { CheckInWizard } from "../checkin";
import { CheckOutWizard } from "../checkout";
import type { CheckInMode, StayFullDetails } from "../types";

export function ControlsPanel({
	userId,
	stayData,
	onCheckInSuccess,
	onCheckOutSuccess,
	checkInResetSignal,
	checkOutResetSignal,
}: {
	userId: string;
	stayData: StayFullDetails;
	onCheckInSuccess: () => void;
	onCheckOutSuccess: () => void;
	checkInResetSignal: number;
	checkOutResetSignal: number;
}) {
	const hasCheckedOut = !!stayData.checkedOutAt;
	const hasCheckedInOnly = !!stayData.checkedInAt && !hasCheckedOut;
	const hasNoRecord = !stayData.exists;
	const checkInMode: CheckInMode = hasCheckedInOnly ? "edit" : "create";
	const checkInTabLabel = hasCheckedInOnly ? "Edit Check-In" : "Check-In";
	const checkInTabDisabled = hasCheckedOut;
	const [activeWizardTab, setActiveWizardTab] = useState<
		"checkin" | "checkout"
	>(stayData.checkedInAt ? "checkout" : "checkin");

	const checkoutDisabled =
		!stayData.exists || !stayData.checkedInAt || !!stayData.checkedOutAt;

	useEffect(() => {
		if (checkoutDisabled && activeWizardTab === "checkout") {
			setActiveWizardTab("checkin");
		}
	}, [checkoutDisabled, activeWizardTab]);

	useEffect(() => {
		if (hasCheckedOut) {
			setActiveWizardTab("checkin");
			return;
		}

		setActiveWizardTab(stayData.checkedInAt ? "checkout" : "checkin");
	}, [hasCheckedOut, stayData.checkedInAt]);

	const disableAllControls = hasCheckedOut;
	const isCheckInDisabled = disableAllControls;
	const isCheckOutDisabled =
		disableAllControls || hasNoRecord || !hasCheckedInOnly;

	return (
		<div className="space-y-3 rounded-md border border-border bg-card p-4">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => {
						if (!checkInTabDisabled) {
							setActiveWizardTab("checkin");
						}
					}}
					disabled={checkInTabDisabled}
					title={
						checkInTabDisabled
							? "Stay completed. No further changes allowed."
							: undefined
					}
					className={`rounded-md px-3 py-1.5 text-sm ${
						activeWizardTab === "checkin"
							? "bg-primary text-primary-foreground"
							: "border border-border hover:bg-muted"
					} ${checkInTabDisabled ? "cursor-not-allowed opacity-50" : ""}`}
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
					Check-Out
				</button>
			</div>

			{activeWizardTab === "checkin" ? (
				<CheckInWizard
					key={`check-in-${userId}-${checkInMode}-${checkInResetSignal}`}
					userId={userId}
					mode={checkInMode}
					disabled={isCheckInDisabled}
					onSuccess={onCheckInSuccess}
				/>
			) : null}

			{activeWizardTab === "checkout" ? (
				<CheckOutWizard
					key={`check-out-${userId}-${checkOutResetSignal}`}
					userId={userId}
					disabled={isCheckOutDisabled}
					onSuccess={onCheckOutSuccess}
				/>
			) : null}
		</div>
	);
}
