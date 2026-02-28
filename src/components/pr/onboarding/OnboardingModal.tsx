import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getStayStatus } from "@/server/admin/admin.pr.getStayStatus";
import { ControlsPanel, StatusPanel } from "./panels";
import type { StayFullDetails } from "./types";

function TabButton({
	label,
	value,
	activeTab,
	onClick,
	disabled,
	title,
}: {
	label: string;
	value: "status" | "controls";
	activeTab: "status" | "controls";
	onClick: (value: "status" | "controls") => void;
	disabled?: boolean;
	title?: string;
}) {
	return (
		<button
			type="button"
			onClick={() => {
				if (!disabled) {
					onClick(value);
				}
			}}
			disabled={disabled}
			title={title}
			className={`rounded-md px-3 py-1.5 text-sm ${
				activeTab === value
					? "bg-primary text-primary-foreground"
					: "border border-border hover:bg-muted"
			} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
		>
			{label}
		</button>
	);
}

export function OnboardingModal({
	userId,
	onClose,
}: {
	userId: string;
	onClose: () => void;
}) {
	const [activeTab, setActiveTab] = useState<"status" | "controls">("status");
	const [checkInResetSignal, setCheckInResetSignal] = useState(0);
	const [checkOutResetSignal, setCheckOutResetSignal] = useState(0);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["pr", "onboarding", "stay-status", userId],
		queryFn: () => getStayStatus({ data: { userId } }),
	});

	const stayData: StayFullDetails = {
		exists: data?.exists ?? false,
		accommodationRequired: data?.accommodationRequired ?? false,
		nightsRequested: data?.nightsRequested ?? 0,
		accommodationFee: data?.accommodationFee ?? 0,
		cautionDeposit: data?.cautionDeposit ?? 0,
		fineAmount: data?.fineAmount ?? 0,
		finePaid: data?.finePaid ?? false,
		cautionReturned: data?.cautionReturned ?? false,
		checkedInAt: data?.checkedInAt ?? null,
		checkedOutAt: data?.checkedOutAt ?? null,
		elapsedDays: data?.elapsedDays ?? 0,
		overstayed: data?.overstayed ?? false,
	};
	const controlsTabDisabled = !!stayData.checkedOutAt;

	useEffect(() => {
		if (controlsTabDisabled && activeTab === "controls") {
			setActiveTab("status");
		}
	}, [controlsTabDisabled, activeTab]);

	const handleModalClose = () => {
		setCheckInResetSignal((currentValue) => currentValue + 1);
		setCheckOutResetSignal((currentValue) => currentValue + 1);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-2xl rounded-md border border-border bg-background shadow-lg">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">Onboarding</h2>
					<button
						type="button"
						onClick={handleModalClose}
						className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
					>
						Close
					</button>
				</div>

				<div className="space-y-3 p-4">
					{isLoading ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Loading onboarding status...
						</div>
					) : null}

					{isError ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Failed to load onboarding status.
						</div>
					) : null}

					{!isLoading && !isError ? (
						<>
							<div className="flex items-center gap-2">
								<TabButton
									label="Status"
									value="status"
									activeTab={activeTab}
									onClick={setActiveTab}
								/>
								<TabButton
									label="Controls"
									value="controls"
									activeTab={activeTab}
									onClick={setActiveTab}
									disabled={controlsTabDisabled}
									title={
										controlsTabDisabled
											? "Stay completed. No further changes allowed."
											: undefined
									}
								/>
							</div>

							{controlsTabDisabled ? (
								<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
									Stay completed. No further changes allowed.
								</div>
							) : null}

							{activeTab === "status" ? (
								<StatusPanel stayData={stayData} />
							) : null}

							{activeTab === "controls" ? (
								<ControlsPanel
									userId={userId}
									stayData={stayData}
									onCheckInSuccess={async () => {
										await refetch();
										handleModalClose();
									}}
									onCheckOutSuccess={async () => {
										await refetch();
										setCheckOutResetSignal((currentValue) => currentValue + 1);
									}}
									checkInResetSignal={checkInResetSignal}
									checkOutResetSignal={checkOutResetSignal}
								/>
							) : null}
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
