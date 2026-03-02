import { useQuery } from "@tanstack/react-query";
import { Edit, Info, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { getStayStatus } from "@/server/admin/pr/query";
import { ControlsPanel } from "./panels/controls-panel";
import { StatusPanel } from "./panels/status-panel";
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
			className={`relative inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-all duration-200 ${
				disabled ? "cursor-not-allowed opacity-50" : ""
			} ${
				isActive
					? "border-[#2a2a2a] bg-[#1f1f1f] text-white"
					: "border-transparent bg-transparent text-[#71717a] hover:text-[#fafafa]"
			}`}
		>
			<Icon size={16} strokeWidth={1.5} color="#a1a1aa" className="mr-2" />
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="w-full max-w-2xl rounded-3xl border border-[#222222] bg-[#111111] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
				<div className="mb-4 flex items-center justify-between border-b border-[#1f1f1f] pb-4">
					<h2 className="inline-flex items-center gap-2 text-[22px] font-semibold tracking-[-0.02em] text-[#fafafa]">
						<Receipt size={20} strokeWidth={1.5} color="#a1a1aa" />
						Onboarding
					</h2>
					<button
						type="button"
						onClick={handleModalClose}
						className="rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-2 text-sm text-[#fafafa] transition-all duration-200 hover:border-[#3a3a3a]"
					>
						Close
					</button>
				</div>

				<div className="space-y-3">
					{isLoading ? (
						<div className="rounded-md border border-[#222222] bg-[#141414] p-4 text-sm text-[#71717a]">
							Loading onboarding status...
						</div>
					) : null}

					{isError ? (
						<div className="rounded-md border border-[#222222] border-l-4 border-l-red-500 bg-[#141414] p-4 text-sm text-red-500">
							Failed to load onboarding status.
						</div>
					) : null}

					{!isLoading && !isError ? (
						<>
							<div className="inline-flex items-center gap-2 rounded-full bg-[#141414] p-1">
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
