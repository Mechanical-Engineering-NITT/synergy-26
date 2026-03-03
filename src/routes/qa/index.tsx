import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { QAAttendanceModal } from "@/components/qa/qa-attendance-modal";
import { requireAdminUser } from "@/lib/utils";
import { getQAEventsWorkshops } from "@/server/admin/qa/query";

const qaEventsWorkshopsQueryOptions = () =>
	queryOptions({
		queryKey: ["qa", "events-workshops"],
		queryFn: () => getQAEventsWorkshops(),
		staleTime: 1000 * 60 * 5,
		refetchInterval: 1000 * 60 * 5,
		refetchOnWindowFocus: true,
	});

export const Route = createFileRoute("/qa/")({
	loader: async () => {
		await requireAdminUser({ data: { roles: ["QA", "MASTER", "ADMIN"] } });
	},
	component: QADashboard,
});

function QADashboard() {
	const [activeTab, setActiveTab] = useState<"event" | "workshop">("workshop");
	const [selectedAction, setSelectedAction] = useState<{
		id: number;
		title: string;
	} | null>(null);

	const { data, isLoading, isError, error } = useQuery({
		...qaEventsWorkshopsQueryOptions(),
	});

	if (isLoading) {
		return (
			<div className="min-h-screen p-6 bg-[#0a0a0a] text-[#fafafa]">
				<div className="mx-auto max-w-7xl rounded-md p-4 text-sm bg-[#141414] text-[#71717a] border border-[#222222]">
					Loading QA dashboard...
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen p-6 bg-[#0a0a0a] text-[#fafafa]">
				<div className="mx-auto max-w-7xl rounded-md p-4 text-sm bg-[#141414] text-[#ef4444] border-l-[3px] border-l-[#ef4444] border-y border-r border-[#222222]">
					{error instanceof Error
						? error.message
						: "Failed to load QA dashboard."}
				</div>
			</div>
		);
	}

	const listData = activeTab === "event" ? data?.events : data?.workshops;

	return (
		<div className="min-h-screen p-6 bg-[#0a0a0a] text-[#fafafa]">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#fafafa]">
							QA Attendance Dashboard
						</h1>
						<p className="text-[12px] text-[#71717a]">
							Manage attendance for events and workshops
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 p-1 bg-[#141414] rounded-lg w-fit border border-[#222222]">
					<button
						type="button"
						onClick={() => setActiveTab("workshop")}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
							activeTab === "workshop"
								? "bg-[#2a2a2a] text-[#fafafa]"
								: "text-[#71717a] hover:text-[#fafafa] hover:bg-[#1f1f1f]"
						}`}
					>
						Workshops
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("event")}
						className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
							activeTab === "event"
								? "bg-[#2a2a2a] text-[#fafafa]"
								: "text-[#71717a] hover:text-[#fafafa] hover:bg-[#1f1f1f]"
						}`}
					>
						Events
					</button>
				</div>

				<div className="bg-[#111111] rounded-[20px] border border-[#222222] overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full min-w-max text-sm text-[#fafafa]">
							<thead className="bg-[#111111]">
								<tr>
									<th className="px-5 py-4 text-left font-medium text-[12px] text-[#71717a] uppercase tracking-[0.05em]">
										<span className="inline-flex items-center gap-1.5">
											<Calendar size={14} strokeWidth={1.5} color="#71717a" />
											Title
										</span>
									</th>
									<th className="px-5 py-4 text-right font-medium text-[12px] text-[#71717a] uppercase tracking-[0.05em]">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#222222]">
								{listData?.map((item: { id: number; title: string }) => (
									<tr
										key={item.id}
										className="hover:bg-[#1a1a1a] transition-colors duration-200"
									>
										<td className="px-5 py-4 whitespace-nowrap font-medium">
											{item.title}
										</td>

										<td className="px-5 py-4 whitespace-nowrap text-right">
											<button
												type="button"
												onClick={() =>
													setSelectedAction({
														id: item.id,
														title: item.title,
													})
												}
												className="inline-flex items-center text-sm bg-white text-black rounded-[8px] px-3 py-1.5 font-medium border border-white transition-opacity duration-200"
											>
												Attendance
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{listData?.length === 0 && (
							<div className="p-8 text-center text-[#71717a] text-sm">
								No {activeTab} found.
							</div>
						)}
					</div>
				</div>
			</div>

			<QAAttendanceModal
				open={!!selectedAction}
				type={activeTab}
				id={selectedAction?.id ?? 0}
				title={selectedAction?.title ?? ""}
				onClose={() => setSelectedAction(null)}
			/>
		</div>
	);
}
