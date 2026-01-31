import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
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
			<div className="flex justify-center p-12">
				<div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
			</div>
		);
	}

	if (!payments || payments.length === 0) {
		return (
			<div className="text-center p-12 bg-white/5 rounded-none border border-dashed border-white/20">
				<p className="text-gray-500 font-black uppercase tracking-[0.3em]">
					No transaction signals found.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left border-collapse min-w-[600px]">
				<thead>
					<tr className="text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.3em]">
						<th className="px-6 py-4 border-b border-white/10">Order ID</th>
						<th className="px-6 py-4 border-b border-white/10">Amount</th>
						<th className="px-6 py-4 border-b border-white/10">Status</th>
						<th className="px-6 py-4 border-b border-white/10">Resource</th>
						<th className="px-6 py-4 border-b border-white/10 text-right">
							Sync
						</th>
					</tr>
				</thead>
				<tbody className="text-xs font-bold uppercase tracking-widest">
					{payments.map((payment) => (
						<tr
							key={payment.id}
							className="group hover:bg-cyan-500/5 transition-colors border-b border-white/5"
						>
							<td className="px-6 py-5 font-mono text-[10px] text-gray-400">
								{payment.razorpayOrderId}
							</td>
							<td className="px-6 py-5 text-white italic">
								₹{payment.amount / 100}
							</td>
							<td className="px-6 py-5">
								<span
									className={`px-3 py-1 border text-[9px] font-black skew-x-12 inline-block ${
										payment.status === "paid"
											? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
											: payment.status === "failed"
												? "bg-red-500/10 text-red-500 border-red-500/30"
												: "bg-amber-500/10 text-amber-400 border-amber-500/30"
									}`}
								>
									{payment.status}
								</span>
							</td>
							<td className="px-6 py-5 text-gray-500 group-hover:text-white transition-colors">
								{payment.isEventPass
									? "Event Pass"
									: payment.accommodation && payment.accommodation > 0
										? `Accom. (${payment.accommodation} N)`
										: payment.workshopTitle || "-"}
							</td>
							<td className="px-6 py-5 text-right">
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
			className="inline-flex items-center justify-center p-2 border border-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all disabled:opacity-50"
			title="Refresh Status"
		>
			<RotateCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
		</button>
	);
}
