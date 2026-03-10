import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { useState } from "react";
import { getOnspotRegistrationOptions } from "@/server/admin/pr/query";
import { OnspotControlsSection } from "./panels/controls-section";

export function OnspotRegistrationModal({
	open,
	userId,
	onClose,
	onRegistrationComplete,
}: {
	open: boolean;
	userId: string | null;
	onClose: () => void;
	onRegistrationComplete: () => Promise<void>;
}) {
	const resolvedUserId = userId ?? "";
	const [controlsResetSignal, setControlsResetSignal] = useState(0);
	const queryClient = useQueryClient();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["pr", "onspot", "options", resolvedUserId],
		queryFn: () =>
			getOnspotRegistrationOptions({
				data: { userId: resolvedUserId },
			}),
		enabled: open && Boolean(userId),
	});

	const handleModalClose = () => {
		setControlsResetSignal((currentValue) => currentValue + 1);
		onClose();
	};

	const handleActionComplete = async () => {
		await queryClient.invalidateQueries({
			queryKey: ["pr", "onspot", "options", resolvedUserId],
		});
		await onRegistrationComplete();
		handleModalClose();
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
						Onspot Registration
					</h2>
					<button
						type="button"
						onClick={handleModalClose}
						className="rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-2 text-sm text-[#fafafa] transition-all duration-200 hover:border-[#3a3a3a]"
					>
						Close
					</button>
				</div>

				{isLoading ? (
					<div className="rounded-md border border-[#222222] bg-[#141414] p-4 text-sm text-[#71717a]">
						Loading onspot registration data...
					</div>
				) : null}

				{isError ? (
					<div className="rounded-md border border-[#222222] border-l-4 border-l-red-500 bg-[#141414] p-4 text-sm text-red-500">
						Failed to load onspot registration data.
					</div>
				) : null}

				{!isLoading && !isError && data ? (
					<OnspotControlsSection
						key={`onspot-controls-${resolvedUserId}-${controlsResetSignal}-${data.eventPassPrice}`}
						userId={resolvedUserId}
						workshops={data.workshops}
						events={data.events}
						eventPassPrice={data.eventPassPrice}
						existingWorkshopRegistrations={data.existingWorkshopRegistrations}
						existingEventRegistrations={data.existingEventRegistrations}
						eventPassAlreadyOwned={data.hasEventPass}
						onActionComplete={handleActionComplete}
					/>
				) : null}
			</div>
		</div>
	);
}
