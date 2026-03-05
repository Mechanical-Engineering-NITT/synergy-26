import { useMutation, useQuery } from "@tanstack/react-query";
import { CopyPlus, RefreshCcw, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { swapWorkshop } from "@/server/admin/pr/mutation";
import { getSwapWorkshopOptions } from "@/server/admin/pr/query";

interface Workshop {
	id: number;
	title: string;
	price: number;
}

export function SwapWorkshopsModal({
	open,
	userId,
	onClose,
	onSwapComplete,
}: {
	open: boolean;
	userId: string | null;
	onClose: () => void;
	onSwapComplete?: () => void;
}) {
	const [fromWorkshopId, setFromWorkshopId] = useState<number | "">("");
	const [toWorkshopId, setToWorkshopId] = useState<number | "">("");
	const fromWorkshopSelectId = useId();
	const toWorkshopSelectId = useId();

	const {
		data: optionsData,
		isLoading: isOptionsLoading,
		isError: isOptionsError,
		refetch: refetchOptions,
	} = useQuery({
		queryKey: ["pr", "swap-options", userId],
		queryFn: () => getSwapWorkshopOptions({ data: { userId: userId ?? "" } }),
		enabled: open && userId !== null,
	});

	useEffect(() => {
		if (open) {
			setFromWorkshopId("");
			setToWorkshopId("");
			if (userId) {
				refetchOptions();
			}
		}
	}, [open, userId, refetchOptions]);

	const { mutate: doSwap, isPending: isSwapping } = useMutation({
		mutationFn: swapWorkshop,
		onSuccess: () => {
			toast.success("Workshops swapped successfully");
			if (onSwapComplete) {
				onSwapComplete();
			}
			onClose();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to swap workshops",
			);
		},
	});

	if (!open || !userId) {
		return null;
	}

	const existingRegistrations =
		optionsData?.existingWorkshopRegistrations ?? [];
	const workshops = (optionsData?.workshops as Workshop[]) ?? [];

	const userWorkshops = workshops.filter((w) =>
		existingRegistrations.includes(w.id),
	);

	const selectedFromWorkshop = workshops.find((w) => w.id === fromWorkshopId);

	const availableTargetWorkshops = selectedFromWorkshop
		? workshops.filter(
				(w) =>
					w.price === selectedFromWorkshop.price &&
					!existingRegistrations.includes(w.id),
			)
		: [];

	const handleSwap = () => {
		if (fromWorkshopId === "" || toWorkshopId === "") {
			return;
		}

		doSwap({
			data: {
				userId,
				fromWorkshopId,
				toWorkshopId,
			},
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div
				className="w-full max-w-md rounded-2xl p-6 shadow-xl relative"
				style={{
					backgroundColor: "#111111",
					border: "1px solid #222222",
				}}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 text-[#71717a] hover:text-[#fafafa] transition-colors"
					disabled={isSwapping}
				>
					<X size={20} />
				</button>

				<div className="mb-6 flex items-center gap-3">
					<div
						className="flex h-10 w-10 items-center justify-center rounded-full"
						style={{ backgroundColor: "#222222" }}
					>
						<RefreshCcw size={20} style={{ color: "#fafafa" }} />
					</div>
					<div>
						<h2
							style={{ color: "#fafafa", fontSize: "18px", fontWeight: "600" }}
						>
							Swap Workshop
						</h2>
						<p style={{ color: "#71717a", fontSize: "14px" }}>
							Select a workshop to swap out.
						</p>
					</div>
				</div>

				{isOptionsLoading ? (
					<div className="py-8 text-center text-[#71717a]">
						Loading workshop options...
					</div>
				) : isOptionsError ? (
					<div className="py-4 text-center text-red-500">
						Failed to load workshop options.
					</div>
				) : (
					<div className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor={fromWorkshopSelectId}
								className="block text-sm font-medium text-[#fafafa]"
							>
								Workshop to give up
							</label>
							<select
								id={fromWorkshopSelectId}
								value={fromWorkshopId}
								onChange={(e) => {
									setFromWorkshopId(
										e.target.value ? Number(e.target.value) : "",
									);
									setToWorkshopId("");
								}}
								disabled={isSwapping}
								className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#555555] active:outline-none"
								style={{
									backgroundColor: "#1a1a1a",
									color: "#fafafa",
									border: "1px solid #333333",
								}}
							>
								<option value="">Select a workshop</option>
								{userWorkshops.map((workshop) => (
									<option key={workshop.id} value={workshop.id}>
										{workshop.title} (₹{Number(workshop.price).toFixed(2)})
									</option>
								))}
							</select>
							{userWorkshops.length === 0 && (
								<p className="text-xs text-[#71717a] mt-1">
									User is not registered for any workshops.
								</p>
							)}
						</div>

						{fromWorkshopId !== "" && (
							<div className="space-y-2">
								<label
									htmlFor={toWorkshopSelectId}
									className="block text-sm font-medium text-[#fafafa]"
								>
									Target workshop
								</label>
								<select
									id={toWorkshopSelectId}
									value={toWorkshopId}
									onChange={(e) =>
										setToWorkshopId(
											e.target.value ? Number(e.target.value) : "",
										)
									}
									disabled={isSwapping}
									className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#555555] active:outline-none"
									style={{
										backgroundColor: "#1a1a1a",
										color: "#fafafa",
										border: "1px solid #333333",
									}}
								>
									<option value="">Select target workshop</option>
									{availableTargetWorkshops.map((workshop) => (
										<option key={workshop.id} value={workshop.id}>
											{workshop.title}
										</option>
									))}
								</select>
								{availableTargetWorkshops.length === 0 && (
									<p className="text-xs text-yellow-500 mt-1">
										No matching priced workshops available for swap.
									</p>
								)}
							</div>
						)}

						<div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#222222]">
							<button
								type="button"
								onClick={onClose}
								disabled={isSwapping}
								className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
								style={{
									color: "#fafafa",
									backgroundColor: "transparent",
									border: "1px solid #333333",
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSwap}
								disabled={
									isSwapping || fromWorkshopId === "" || toWorkshopId === ""
								}
								className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 flex items-center gap-2"
								style={{
									backgroundColor: "#ffffff",
									color: "#000000",
								}}
							>
								{isSwapping ? (
									"Swapping..."
								) : (
									<>
										<CopyPlus size={16} />
										Confirm Swap
									</>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
