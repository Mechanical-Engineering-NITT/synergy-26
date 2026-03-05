import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Download, LayoutDashboard, Users } from "lucide-react";
import { FLOORS, HOSTELS } from "@/lib/constants";
import { requireAdminUser } from "@/lib/utils";
import { getHostelStats } from "@/server/admin/pr/query";

export const Route = createFileRoute("/pr/status")({
	loader: async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
	},
	component: StatusRoute,
});

function StatusRoute() {
	const { data: stats, isLoading } = useQuery({
		queryKey: ["hostelStats"],
		queryFn: () => getHostelStats(),
	});

	const totalOccupants = stats?.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

	const getCount = (hostel: string, floor: string) => {
		return (
			stats?.find((s) => s.hostelName === hostel && s.floor === floor)?.count ??
			0
		);
	};

	return (
		<div
			className="min-h-screen p-4 md:p-8"
			style={{ backgroundColor: "#09090b", color: "#fafafa" }}
		>
			<div className="mx-auto max-w-7xl space-y-8">
				{/* Header Section */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[#fafafa]">
							<LayoutDashboard className="text-[#a855f7]" size={32} />
							Accommodation Status
						</h1>
						<p className="mt-2 text-[#a1a1aa]">
							Real-time occupancy tracking and floor-wise distribution.
						</p>
					</div>
					<a
						href="/api/master/download?type=accommodation"
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-[#09090b] transition-all hover:bg-[#e4e4e7] active:scale-95"
					>
						<Download size={18} />
						Download Full Report
					</a>
				</div>

				{/* Summary Card */}
				<div className="rounded-3xl border border-[#222222] bg-[#111111] p-8 shadow-2xl">
					<div className="flex items-center gap-4">
						<div className="rounded-2xl bg-[#a855f7]/10 p-4">
							<Users className="text-[#a855f7]" size={32} />
						</div>
						<div>
							<p className="text-sm font-medium text-[#a1a1aa]">
								Total Active Occupants
							</p>
							<p className="text-4xl font-bold text-[#fafafa]">
								{isLoading ? "..." : totalOccupants}
							</p>
						</div>
					</div>
				</div>

				{/* Hostel Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{HOSTELS.map((hostel) => {
						const hostelTotal =
							stats
								?.filter((s) => s.hostelName === hostel)
								.reduce((acc, curr) => acc + curr.count, 0) ?? 0;

						return (
							<div
								key={hostel}
								className="flex flex-col overflow-hidden rounded-3xl border border-[#222222] bg-[#111111] transition-all hover:border-[#a855f7]/50"
							>
								<div className="border-b border-[#222222] bg-[#18181b] p-5">
									<div className="flex items-center justify-between">
										<h3 className="flex items-center gap-2 font-semibold text-[#fafafa]">
											<Building2 size={18} className="text-[#a1a1aa]" />
											{hostel}
										</h3>
										<span className="rounded-full bg-[#a855f7]/10 px-2.5 py-1 text-xs font-bold text-[#a855f7]">
											{hostelTotal} Active
										</span>
									</div>
								</div>
								<div className="flex-1 p-5">
									<div className="space-y-4">
										{FLOORS.map((floor) => {
											const count = getCount(hostel, floor);
											return (
												<div
													key={floor}
													className="flex items-center justify-between"
												>
													<span className="text-sm text-[#a1a1aa]">
														{floor}
													</span>
													<div className="flex items-center gap-2">
														<div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#222222]">
															<div
																className="h-full bg-[#a855f7] transition-all"
																style={{
																	width: `${Math.min(100, (count / 20) * 100)}%`,
																}}
															/>
														</div>
														<span className="min-w-6 text-right text-sm font-bold text-[#fafafa]">
															{count}
														</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
