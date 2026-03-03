import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	Info,
	Plus,
	Search,
	Tent,
	Ticket,
	X,
} from "lucide-react";
import { useState } from "react";
import { markAttendance } from "@/server/admin/qa/mutation";
import {
	getQAAttendance,
	verifyUserForAttendance,
} from "@/server/admin/qa/query";

export function QAAttendanceModal({
	open,
	type,
	id,
	title,
	onClose,
}: {
	open: boolean;
	type: "event" | "workshop";
	id: number;
	title: string;
	onClose: () => void;
}) {
	const [synergyId, setSynergyId] = useState("");
	const [debouncedId, setDebouncedId] = useState("");

	const {
		data: attendanceData,
		isLoading: isAttendanceLoading,
		refetch: refetchAttendance,
	} = useQuery({
		queryKey: ["qa", "attendance", type, id],
		queryFn: () => getQAAttendance({ data: { type, id } }),
		enabled: open,
	});

	const verifyMutation = useMutation({
		mutationFn: async (searchId: string) =>
			verifyUserForAttendance({
				data: { synergyId: searchId, type, id },
			}),
	});

	const markMutation = useMutation({
		mutationFn: async (searchId: string) =>
			markAttendance({
				data: { synergyId: searchId, type, id },
			}),
		onSuccess: () => {
			setSynergyId("");
			setDebouncedId("");
			refetchAttendance();
		},
	});

	const handleSearch = async () => {
		if (synergyId.length !== 4) return;
		setDebouncedId(synergyId);
		await verifyMutation.mutateAsync(synergyId);
	};

	if (!open) return null;

	const attendedUsers = (attendanceData ?? []) as {
		id: number;
		name: string;
		email: string;
		synergyId: string | null;
	}[];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="w-full max-w-3xl rounded-3xl border border-[#222222] bg-[#111111] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="mb-6 flex items-start justify-between border-b border-[#1f1f1f] pb-4 shrink-0">
					<div>
						<h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#fafafa]">
							Manage Attendance
						</h2>
						<p className="text-sm text-[#a1a1aa] mt-1">{title}</p>
					</div>
					<button
						type="button"
						onClick={() => {
							setSynergyId("");
							setDebouncedId("");
							verifyMutation.reset();
							onClose();
						}}
						className="rounded-lg p-2 text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#fafafa] transition-colors duration-200"
					>
						<X size={20} />
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden min-h-0">
					{/* Left Column - verification panel */}
					<div className="flex flex-col gap-4 overflow-y-auto pr-2">
						<h3 className="text-sm font-medium text-[#fafafa] uppercase tracking-wider">
							Mark Attendance
						</h3>

						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="relative flex-1">
									<Search
										className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]"
										size={16}
									/>
									<input
										type="text"
										maxLength={4}
										value={synergyId}
										onChange={(e) => {
											const val = e.target.value.replace(/\D/g, "");
											setSynergyId(val);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSearch();
										}}
										placeholder="Enter 4-digit ID..."
										className="w-full rounded-xl border border-[#222222] bg-[#141414] py-2.5 pl-10 pr-4 text-sm text-[#fafafa] transition-all placeholder:text-[#71717a] focus:border-[#3a3a3a] focus:outline-none focus:ring-1 focus:ring-[#3a3a3a]"
									/>
								</div>
								<button
									type="button"
									onClick={handleSearch}
									disabled={synergyId.length !== 4 || verifyMutation.isPending}
									className="rounded-xl px-4 py-2.5 text-sm font-medium bg-white text-black border border-white hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
								>
									{verifyMutation.isPending ? "Checking..." : "Verify"}
								</button>
							</div>

							{verifyMutation.isError && (
								<div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-sm">
									{verifyMutation.error instanceof Error
										? verifyMutation.error.message
										: "Verification failed."}
								</div>
							)}

							{verifyMutation.isSuccess && verifyMutation.data && (
								<div className="space-y-4 pt-2">
									{!verifyMutation.data.success ? (
										<div className="p-4 rounded-xl border border-yellow-500/20 bg-[#1a1a1a] flex gap-3 text-sm">
											<Info
												className="shrink-0 text-yellow-500 mt-0.5"
												size={18}
											/>
											<span className="text-[#a1a1aa]">
												{verifyMutation.data.message}
											</span>
										</div>
									) : (
										<div className="space-y-4">
											<div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-sm space-y-3">
												<div className="flex items-center gap-2 text-[#fafafa] mb-2 font-medium">
													<CheckCircle2 className="text-green-500" size={18} />
													Eligibility Verified
												</div>
												<div className="flex justify-between items-center text-[#a1a1aa] border-b border-[#222] pb-2">
													<span>User</span>
													<span className="text-[#fafafa] font-medium">
														{verifyMutation.data.user?.name}
													</span>
												</div>
												<div className="flex items-center gap-2 text-[#a1a1aa]">
													<Ticket size={16} className="text-green-500" />{" "}
													Registered
												</div>
												<div className="flex items-center gap-2 text-[#a1a1aa]">
													<Tent size={16} className="text-green-500" /> PR
													Checked In
												</div>
											</div>

											<button
												type="button"
												onClick={() => markMutation.mutate(debouncedId)}
												disabled={markMutation.isPending}
												className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-white text-black border border-white hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
											>
												<Plus size={18} />
												{markMutation.isPending
													? "Marking..."
													: "Mark as Attended"}
											</button>

											{markMutation.isError && (
												<div className="text-red-500 text-xs mt-2 text-center">
													{markMutation.error instanceof Error
														? markMutation.error.message
														: "Failed to mark attendance"}
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Right Column - list of attended users */}
					<div className="flex flex-col overflow-hidden border-l border-[#1f1f1f] pl-8">
						<div className="flex justify-between items-center mb-4 shrink-0">
							<h3 className="text-sm font-medium text-[#fafafa] uppercase tracking-wider">
								Attended Users
							</h3>
							<span className="bg-[#1f1f1f] text-xs px-2 py-1 rounded text-[#a1a1aa]">
								{attendedUsers.length} total
							</span>
						</div>

						{isAttendanceLoading ? (
							<div className="text-sm text-[#71717a] py-4 text-center">
								Loading list...
							</div>
						) : attendedUsers.length === 0 ? (
							<div className="text-sm text-[#71717a] py-8 text-center flex flex-col items-center gap-2 h-full justify-center">
								<Info size={24} className="opacity-20" />
								No users have been marked as attended yet.
							</div>
						) : (
							<div className="relative flex-1 min-h-0">
								<div className="absolute inset-0 overflow-y-auto pr-2 space-y-2">
									{attendedUsers.map((user) => (
										<div
											key={user.id}
											className="p-3 rounded-lg border border-[#222222] bg-[#141414] flex justify-between items-center group hover:border-[#333] transition-colors"
										>
											<div>
												<p className="text-sm font-medium text-[#fafafa]">
													{user.name}
												</p>
												<p className="text-xs text-[#71717a]">{user.email}</p>
											</div>
											<div className="text-xs font-mono text-[#a1a1aa] bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]">
												{user.synergyId}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
