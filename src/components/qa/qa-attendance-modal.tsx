import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle2,
	Download,
	Info,
	Layers,
	Loader2,
	Plus,
	Search,
	Tent,
	Ticket,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { createSession, markAttendance } from "@/server/admin/qa/mutation";
import {
	getQAAttendance,
	getSessionsForEventWorkshop,
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
	const queryClient = useQueryClient();

	// Session state
	const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
		null,
	);
	const [newSessionName, setNewSessionName] = useState("");
	const [showNewSessionInput, setShowNewSessionInput] = useState(false);
	const newSessionInputRef = useRef<HTMLInputElement>(null);

	// Attendance form state
	const [synergyId, setSynergyId] = useState("");
	const [debouncedId, setDebouncedId] = useState("");

	// Sessions query
	const { data: sessionsData, isLoading: isSessionsLoading } = useQuery({
		queryKey: ["qa", "sessions", type, id],
		queryFn: () => getSessionsForEventWorkshop({ data: { type, id } }),
		enabled: open,
		staleTime: 0,
	});

	// Attendance query (filtered by selected session)
	const {
		data: attendanceData,
		isLoading: isAttendanceLoading,
		refetch: refetchAttendance,
	} = useQuery({
		queryKey: ["qa", "attendance", type, id, selectedSessionId],
		queryFn: () =>
			getQAAttendance({
				data: { type, id, sessionId: selectedSessionId ?? undefined },
			}),
		enabled: open,
	});

	// Create session mutation
	const createSessionMutation = useMutation({
		mutationFn: async (name: string) =>
			createSession({ data: { type, id, name } }),
		onSuccess: (newSession) => {
			queryClient.invalidateQueries({
				queryKey: ["qa", "sessions", type, id],
			});
			setSelectedSessionId(newSession.id);
			setNewSessionName("");
			setShowNewSessionInput(false);
		},
	});

	// Verify mutation
	const verifyMutation = useMutation({
		mutationFn: async (searchId: string) =>
			verifyUserForAttendance({
				data: {
					synergyId: searchId,
					type,
					id,
					sessionId: selectedSessionId ?? undefined,
				},
			}),
	});

	// Mark attendance mutation
	const markMutation = useMutation({
		mutationFn: async (searchId: string) =>
			markAttendance({
				data: {
					synergyId: searchId,
					type,
					id,
					sessionId: selectedSessionId ?? undefined,
				},
			}),
		onSuccess: () => {
			setSynergyId("");
			setDebouncedId("");
			verifyMutation.reset();
			refetchAttendance();
		},
	});

	const handleSearch = async () => {
		if (synergyId.length !== 4) return;
		setDebouncedId(synergyId);
		verifyMutation.reset();
		markMutation.reset();
		await verifyMutation.mutateAsync(synergyId);
	};

	const handleCreateSession = async () => {
		const name = newSessionName.trim();
		if (!name) return;
		await createSessionMutation.mutateAsync(name);
	};

	const handleClose = () => {
		setSynergyId("");
		setDebouncedId("");
		setSelectedSessionId(null);
		setNewSessionName("");
		setShowNewSessionInput(false);
		verifyMutation.reset();
		markMutation.reset();
		onClose();
	};

	// Reset verification when switching sessions
	const handleSelectSession = (sessionId: number | null) => {
		if (sessionId === selectedSessionId) return;
		setSelectedSessionId(sessionId);
		setSynergyId("");
		setDebouncedId("");
		verifyMutation.reset();
		markMutation.reset();
	};

	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = async () => {
		setIsDownloading(true);
		try {
			const params = new URLSearchParams({
				type,
				id: String(id),
				title,
			});
			if (selectedSessionId != null) {
				params.set("sessionId", String(selectedSessionId));
			}
			const res = await fetch(`/api/qa/download/attendance?${params}`);
			if (!res.ok) throw new Error("Failed to download");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const cd = res.headers.get("Content-Disposition");
			const filename =
				cd?.match(/filename="(.+)"/)?.at(1) ??
				`${title.replace(/\s+/g, "_")}_attendance.xlsx`;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setIsDownloading(false);
		}
	};

	if (!open) return null;

	const sessions = sessionsData ?? [];
	const noSessionSelected = selectedSessionId === null;

	const rawAttendedUsers = (attendanceData ?? []) as {
		id: number;
		userId: string;
		name: string;
		email: string;
		synergyId: string | null;
		sessionId: number | null;
	}[];

	// In "All" view, deduplicate by userId so each person appears only once
	const attendedUsers = noSessionSelected
		? rawAttendedUsers.filter(
				(u, idx, arr) => arr.findIndex((x) => x.userId === u.userId) === idx,
			)
		: rawAttendedUsers;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="w-[90vw] h-[90vh] rounded-3xl border border-[#222222] bg-[#111111] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex flex-col">
				{/* Header */}
				<div className="mb-5 flex items-start justify-between border-b border-[#1f1f1f] pb-4 shrink-0">
					<div>
						<h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#fafafa]">
							Manage Attendance
						</h2>
						<p className="text-sm text-[#a1a1aa] mt-1">{title}</p>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="rounded-lg p-2 text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-[#fafafa] transition-colors duration-200"
					>
						<X size={20} />
					</button>
				</div>

				{/* Session Selector */}
				<div className="mb-5 shrink-0">
					<div className="flex items-center gap-2 mb-2">
						<Layers size={13} className="text-[#71717a]" />
						<span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
							Session
						</span>
					</div>

					{isSessionsLoading ? (
						<div className="flex items-center gap-2 text-[#71717a] text-sm">
							<Loader2 size={14} className="animate-spin" />
							Loading sessions...
						</div>
					) : (
						<div className="flex flex-wrap items-center gap-2">
							{/* "All" chip */}
							<button
								type="button"
								onClick={() => handleSelectSession(null)}
								className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
									noSessionSelected
										? "bg-[#fafafa] text-black border-[#fafafa]"
										: "bg-[#1a1a1a] text-[#a1a1aa] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#fafafa]"
								}`}
							>
								All
							</button>

							{sessions.map((s) => (
								<button
									key={s.id}
									type="button"
									onClick={() => handleSelectSession(s.id)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
										selectedSessionId === s.id
											? "bg-[#fafafa] text-black border-[#fafafa]"
											: "bg-[#1a1a1a] text-[#a1a1aa] border-[#2a2a2a] hover:border-[#3a3a3a] hover:text-[#fafafa]"
									}`}
								>
									{s.name}
								</button>
							))}

							{/* Add session */}
							{showNewSessionInput ? (
								<div className="flex items-center gap-1.5">
									<input
										ref={newSessionInputRef}
										type="text"
										value={newSessionName}
										onChange={(e) => setNewSessionName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleCreateSession();
											if (e.key === "Escape") {
												setShowNewSessionInput(false);
												setNewSessionName("");
											}
										}}
										placeholder="Session name"
										className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#fafafa] placeholder:text-[#71717a] focus:border-[#555] focus:outline-none w-36"
									/>
									<button
										type="button"
										onClick={handleCreateSession}
										disabled={
											!newSessionName.trim() || createSessionMutation.isPending
										}
										className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									>
										{createSessionMutation.isPending ? "..." : "Add"}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowNewSessionInput(false);
											setNewSessionName("");
										}}
										className="p-1.5 rounded-lg text-[#71717a] hover:text-[#fafafa] transition-colors"
									>
										<X size={14} />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => {
										setShowNewSessionInput(true);
										setTimeout(() => newSessionInputRef.current?.focus(), 50);
									}}
									className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717a] border border-dashed border-[#2a2a2a] hover:border-[#444] hover:text-[#fafafa] transition-all"
								>
									<Plus size={12} />
									New Session
								</button>
							)}
						</div>
					)}

					{createSessionMutation.isError && (
						<p className="text-xs text-red-500 mt-1.5">
							{createSessionMutation.error instanceof Error
								? createSessionMutation.error.message
								: "Failed to create session"}
						</p>
					)}
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
					{/* Left Column - verification panel */}
					<div className="flex flex-col gap-4 overflow-y-auto pr-2 min-h-0">
						<h3 className="text-sm font-medium text-[#fafafa] uppercase tracking-wider">
							Mark Attendance
						</h3>

						{noSessionSelected ? (
							<div className="p-4 rounded-xl border border-[#222222] bg-[#141414] flex gap-3 text-sm">
								<Info className="shrink-0 text-[#71717a] mt-0.5" size={16} />
								<span className="text-[#71717a]">
									Select a session above to mark attendance.
								</span>
							</div>
						) : (
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
											placeholder="Enter 4-digit Synergy ID"
											className="w-full rounded-xl border border-[#222222] bg-[#141414] py-2.5 pl-10 pr-4 text-sm text-[#fafafa] transition-all placeholder:text-[#71717a] focus:border-[#3a3a3a] focus:outline-none focus:ring-1 focus:ring-[#3a3a3a]"
										/>
									</div>
									<button
										type="button"
										onClick={handleSearch}
										disabled={
											synergyId.length !== 4 || verifyMutation.isPending
										}
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
														<CheckCircle2
															className="text-green-500"
															size={18}
														/>
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
						)}
					</div>

					{/* Right Column - list of attended users */}
					<div className="flex flex-col min-h-0 border-l border-[#1f1f1f] pl-8">
						<div className="flex justify-between items-center mb-4 shrink-0">
							<h3 className="text-sm font-medium text-[#fafafa] uppercase tracking-wider">
								{noSessionSelected ? "All Attended" : "Session Attended"}
							</h3>
							<div className="flex items-center gap-2">
								<span className="bg-[#1f1f1f] text-xs px-2 py-1 rounded text-[#a1a1aa]">
									{attendedUsers.length} total
								</span>
								<button
									type="button"
									onClick={handleDownload}
									disabled={isDownloading || attendedUsers.length === 0}
									className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[#2a2a2a] bg-[#1a1a1a] text-[#a1a1aa] hover:border-[#3a3a3a] hover:text-[#fafafa] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
								>
									{isDownloading ? (
										<Loader2 size={12} className="animate-spin" />
									) : (
										<Download size={12} />
									)}
									{isDownloading ? "Exporting..." : "Export"}
								</button>
							</div>
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
									{attendedUsers.map((u) => (
										<div
											key={u.id}
											className="p-3 rounded-lg border border-[#222222] bg-[#141414] flex justify-between items-center group hover:border-[#333] transition-colors"
										>
											<div>
												<p className="text-sm font-medium text-[#fafafa]">
													{u.name}
												</p>
												<p className="text-xs text-[#71717a]">{u.email}</p>
											</div>
											<div className="text-xs font-mono text-[#a1a1aa] bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]">
												{u.synergyId}
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
