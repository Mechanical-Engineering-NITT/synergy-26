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
	const sharedTabStyle = (active: boolean) => ({
		backgroundColor: active ? "#1f1f1f" : "transparent",
		color: active ? "#ffffff" : "#71717a",
		border: active ? "1px solid #2a2a2a" : "1px solid transparent",
		transition: "all 0.2s ease",
	});

	return (
		<div
			className="space-y-3 rounded-md p-4"
			style={{
				backgroundColor: "#141414",
				color: "#fafafa",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<div
				className="flex items-center gap-2"
				style={{
					backgroundColor: "#141414",
					borderRadius: "999px",
					padding: "4px",
				}}
			>
				<button
					type="button"
					onClick={() => {
						setActiveWizardTab("checkin");
					}}
					className="relative inline-flex items-center rounded-md px-3 py-1.5 text-sm"
					style={sharedTabStyle(activeWizardTab === "checkin")}
				>
					<Home
						size={16}
						strokeWidth={1.5}
						color="#71717a"
						style={{ marginRight: "8px" }}
					/>
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
					className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm ${checkoutDisabled ? "cursor-not-allowed opacity-50" : ""}`}
					style={sharedTabStyle(activeWizardTab === "checkout")}
				>
					<DoorOpen
						size={16}
						strokeWidth={1.5}
						color="#71717a"
						style={{ marginRight: "8px" }}
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
