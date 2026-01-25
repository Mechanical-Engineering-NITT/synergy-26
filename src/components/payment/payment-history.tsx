import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader, RotateCw } from "lucide-react";
import { getUserPayments, syncOrderStatus } from "@/server/razorpay";

export function PaymentHistory() {
	const {
		data: payments,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["userPayments"],
		queryFn: () => getUserPayments(),
	});

	if (isLoading) {
		return (
			<div className="flex justify-center p-8">
				<Loader className="animate-spin h-6 w-6 text-zinc-400" />
			</div>
		);
	}

	if (!payments || payments.length === 0) {
		return (
			<div className="text-center p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
				<p className="text-zinc-500 dark:text-zinc-400">No payments found.</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto -mx-4 sm:mx-0">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
						<th className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
							Order ID
						</th>
						<th className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
							Amount
						</th>
						<th className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
							Status
						</th>
						<th className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
							Remarks
						</th>
						<th className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"></th>
					</tr>
				</thead>
				<tbody className="text-sm">
					{payments.map((payment) => (
						<tr
							key={payment.id}
							className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
						>
							<td className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 font-mono text-xs">
								{payment.razorpayOrderId}
							</td>
							<td className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
								₹{payment.amount / 100}
							</td>
							<td className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 uppercase text-[10px] font-bold">
								<span
									className={`px-2 py-1 rounded-full ${
										payment.status === "paid"
											? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
											: payment.status === "failed"
												? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
												: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
									}`}
								>
									{payment.status}
								</span>
							</td>
							<td className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
								{payment.isEventPass
									? "Event Pass"
									: payment.accommodation && payment.accommodation > 0
										? `Accommodation (${payment.accommodation} nights)`
										: payment.workshopTitle || "-"}
							</td>
							<td className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 text-right">
								{(payment.status === "created" ||
									payment.status === "attempted") && (
									<SyncStatusButton
										orderId={payment.razorpayOrderId}
										onSuccess={refetch}
									/>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function SyncStatusButton({
	orderId,
	onSuccess,
}: {
	orderId: string;
	onSuccess: () => void;
}) {
	const { mutate: syncStatus, isPending } = useMutation({
		mutationFn: (orderId: string) => syncOrderStatus({ data: { orderId } }),
		onSuccess,
	});

	return (
		<button
			type="button"
			onClick={() => syncStatus(orderId)}
			disabled={isPending}
			className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 disabled:opacity-50"
			title="Refresh Status"
		>
			<RotateCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
		</button>
	);
}
