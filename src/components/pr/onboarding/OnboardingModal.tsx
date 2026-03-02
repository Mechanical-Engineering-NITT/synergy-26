import { useQuery } from "@tanstack/react-query";
import { Edit, Info, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { getStayStatus } from "@/server/admin/admin.pr.getStayStatus";
import { ControlsPanel } from "./panels/ControlsPanel";
import { StatusPanel } from "./panels/StatusPanel";
import type { StayFullDetails } from "./types";

function TabButton({
	label,
	value,
	activeTab,
	onClick,
	disabled,
	title,
	icon,
}: {
	label: string;
	value: "status" | "controls";
	activeTab: "status" | "controls";
	onClick: (value: "status" | "controls") => void;
	disabled?: boolean;
	title?: string;
	icon: typeof Info;
}) {
	const Icon = icon;
	const isActive = activeTab === value;

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
			className={`relative inline-flex items-center rounded-md px-3 py-1.5 text-sm ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
			style={{
				backgroundColor: isActive ? "#1f1f1f" : "transparent",
				color: isActive ? "#ffffff" : "#71717a",
				border: isActive ? "1px solid #2a2a2a" : "1px solid transparent",
				transition: "all 0.2s ease",
			}}
		>
			<Icon
				size={16}
				strokeWidth={1.5}
				color="#a1a1aa"
				style={{ marginRight: "8px" }}
			/>
			{label}
		</button>
	);
}

export function OnboardingModal({
	open,
	userId,
	onClose,
}: {
	open: boolean;
	userId: string | null;
	onClose: () => void;
}) {
	const resolvedUserId = userId ?? "";
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["pr", "onboarding", "stay-status", resolvedUserId],
		queryFn: () => getStayStatus({ data: { userId: resolvedUserId } }),
		enabled: open && Boolean(userId),
	});

	const stay = data;
	// biome-ignore lint/correctness/useExhaustiveDependencies: initial tab is intentionally computed once on mount
	const initialTab = useMemo<"status" | "controls">(() => {
		if (!stay) {
			return "controls";
		}

		if (stay.checkedOutAt) {
			return "status";
		}

		return "controls";
	}, []);
	const [activeTab, setActiveTab] = useState<"status" | "controls">(initialTab);
	const [checkInResetSignal, setCheckInResetSignal] = useState(0);
	const [checkOutResetSignal, setCheckOutResetSignal] = useState(0);

	const stayData: StayFullDetails = {
		exists: data?.exists ?? false,
		accommodationRequired: data?.accommodationRequired ?? false,
		nightsRequested: data?.nightsRequested ?? 0,
		accommodationFee: data?.accommodationFee ?? 0,
		cautionDeposit: data?.cautionDeposit ?? 0,
		hostelName: data?.hostelName ?? null,
		floor: data?.floor ?? null,
		paymentVerified: data?.paymentVerified ?? false,
		fineAmount: data?.fineAmount ?? 0,
		finePaid: data?.finePaid ?? false,
		cautionReturned: data?.cautionReturned ?? false,
		checkedInAt: data?.checkedInAt ?? null,
		checkedOutAt: data?.checkedOutAt ?? null,
		updatedAt: data?.updatedAt ?? null,
		elapsedDays: data?.elapsedDays ?? 0,
		overstayed: data?.overstayed ?? false,
	};

	const handleModalClose = () => {
		setCheckInResetSignal((currentValue) => currentValue + 1);
		setCheckOutResetSignal((currentValue) => currentValue + 1);
		onClose();
	};

	const handleActionComplete = async () => {
		await refetch();
		setActiveTab("status");
	};

	if (!open) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(10,10,10,0.8)" }}
		>
			<div
				className="w-full max-w-2xl"
				style={{
					backgroundColor: "#111111",
					borderRadius: "24px",
					border: "1px solid #222222",
					padding: "28px",
					boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
				}}
			>
				<div
					className="mb-4 flex items-center justify-between"
					style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: "16px" }}
				>
					<h2
						className="inline-flex items-center"
						style={{
							fontSize: "22px",
							fontWeight: 600,
							letterSpacing: "-0.02em",
							color: "#fafafa",
							gap: "8px",
						}}
					>
						<Receipt size={20} strokeWidth={1.5} color="#a1a1aa" />
						Onboarding
					</h2>
					<button
						type="button"
						onClick={handleModalClose}
						className="text-sm"
						style={{
							backgroundColor: "transparent",
							color: "#fafafa",
							borderRadius: "10px",
							padding: "8px 16px",
							border: "1px solid #2a2a2a",
							transition: "all 0.2s ease",
						}}
					>
						Close
					</button>
				</div>

				<div className="space-y-3">
					{isLoading ? (
						<div
							className="rounded-md p-4 text-sm"
							style={{
								backgroundColor: "#141414",
								color: "#71717a",
								border: "1px solid #222222",
							}}
						>
							Loading onboarding status...
						</div>
					) : null}

					{isError ? (
						<div
							className="rounded-md p-4 text-sm"
							style={{
								backgroundColor: "#141414",
								color: "#ef4444",
								borderLeft: "3px solid #ef4444",
								borderTop: "1px solid #222222",
								borderRight: "1px solid #222222",
								borderBottom: "1px solid #222222",
							}}
						>
							Failed to load onboarding status.
						</div>
					) : null}

					{!isLoading && !isError ? (
						<>
							<div
								className="inline-flex items-center gap-2"
								style={{
									backgroundColor: "#141414",
									borderRadius: "999px",
									padding: "4px",
								}}
							>
								<TabButton
									label="Status"
									value="status"
									activeTab={activeTab}
									onClick={setActiveTab}
									icon={Info}
								/>
								<TabButton
									label="Controls"
									value="controls"
									activeTab={activeTab}
									onClick={setActiveTab}
									icon={Edit}
								/>
							</div>

							{activeTab === "status" ? (
								<StatusPanel stayData={stayData} />
							) : null}

							{activeTab === "controls" ? (
								<ControlsPanel
									userId={resolvedUserId}
									stayData={stayData}
									onActionComplete={handleActionComplete}
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
