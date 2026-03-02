import { DoorOpen, Home } from "lucide-react";
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
	const getWizardTabClassName = (active: boolean) =>
		`relative inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-all duration-200 ${
			active
				? "border-[#2a2a2a] bg-[#1f1f1f] text-white"
				: "border-transparent bg-transparent text-[#71717a]"
		}`;

	return (
		<div className="space-y-3 rounded-md border border-[#222222] bg-[#141414] p-4 text-[#fafafa] transition-all duration-200">
			<div className="flex items-center gap-2 rounded-full bg-[#141414] p-1">
				<button
					type="button"
					onClick={() => {
						setActiveWizardTab("checkin");
					}}
					className={getWizardTabClassName(activeWizardTab === "checkin")}
				>
					<Home size={16} strokeWidth={1.5} color="#71717a" className="mr-2" />
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
					className={`${getWizardTabClassName(activeWizardTab === "checkout")} ${checkoutDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					<DoorOpen
						size={16}
						strokeWidth={1.5}
						color="#71717a"
						className="mr-2"
					/>
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
