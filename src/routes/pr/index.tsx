import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, DoorOpen, RefreshCw, User, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OnboardingModal } from "@/components/pr/onboarding";
import { PrUserDetailsModal } from "@/components/pr/pr-details-modal";
import { PrUsersPagination } from "@/components/pr/pr-pagination";
import { PrUserSearchBar } from "@/components/pr/pr-search-bar";
import { requireAdminUser } from "@/lib/utils";
import { getPrUserDetails, getPrUsers } from "@/server/admin/admin.pr";

const DEFAULT_PAGE_SIZE = 25;
const REFRESH_INTERVAL_MS = 1000 * 60 * 5;

const prUsersQueryOptions = () =>
	queryOptions({
		queryKey: ["pr-users"],
		queryFn: () => getPrUsers(),
		staleTime: REFRESH_INTERVAL_MS,
		refetchInterval: REFRESH_INTERVAL_MS,
		refetchOnWindowFocus: true,
	});

const prUserDetailsQueryOptions = (userId: string) =>
	queryOptions({
		queryKey: ["pr", "user-details", userId],
		queryFn: () => getPrUserDetails({ data: { userId } }),
		enabled: userId.length > 0,
	});

export const Route = createFileRoute("/pr/")({
	loader: async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [selectedOnboardingUserId, setSelectedOnboardingUserId] = useState<
		string | null
	>(null);
	const [activeTab, setActiveTab] = useState("profile");

	const {
		data: usersData,
		isLoading: isUsersLoading,
		isError: isUsersError,
		isFetching: isUsersFetching,
		error: usersError,
		refetch: refetchPrUsers,
	} = useQuery({
		...prUsersQueryOptions(),
	});

	const {
		data: detailsData,
		isLoading: isDetailsLoading,
		isError: isDetailsError,
	} = useQuery({
		...prUserDetailsQueryOptions(selectedUserId ?? ""),
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedSearch(searchInput.trim());
		}, 450);

		return () => clearTimeout(timeout);
	}, [searchInput]);

	const handleSearchInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearchInput(event.target.value);
			setCurrentPage(1);
		},
		[],
	);

	const handleSearchClear = useCallback(() => {
		setSearchInput("");
		setDebouncedSearch("");
		setCurrentPage(1);
	}, []);

	const handlePageSizeChange = useCallback((value: number) => {
		setPageSize(value);
		setCurrentPage(1);
	}, []);

	const users = usersData?.data.rows ?? [];
	const filteredUsers = useMemo(() => {
		if (!debouncedSearch) {
			return users;
		}

		const loweredSearch = debouncedSearch.toLowerCase();
		return users.filter((currentUser) =>
			currentUser.email.toLowerCase().includes(loweredSearch),
		);
	}, [users, debouncedSearch]);

	const totalResults = filteredUsers.length;
	const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);

	const paginatedUsers = useMemo(() => {
		const start = (safeCurrentPage - 1) * pageSize;
		return filteredUsers.slice(start, start + pageSize);
	}, [filteredUsers, safeCurrentPage, pageSize]);

	const rangeStart =
		totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
	const rangeEnd = Math.min(safeCurrentPage * pageSize, totalResults);
	const usersErrorMessage =
		usersError instanceof Error
			? usersError.message
			: "Failed to load admin users.";

	if (isUsersLoading) {
		return (
			<div
				className="min-h-screen p-6"
				style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
			>
				<div
					className="mx-auto max-w-7xl rounded-md p-4 text-sm"
					style={{
						backgroundColor: "#141414",
						color: "#71717a",
						border: "1px solid #222222",
					}}
				>
					Loading admin users...
				</div>
			</div>
		);
	}

	if (isUsersError) {
		return (
			<div
				className="min-h-screen p-6"
				style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
			>
				<div
					className="mx-auto max-w-7xl rounded-md p-4 text-sm"
					style={{
						backgroundColor: "#141414",
						color: "#ef4444",
						borderLeft: "3px solid #ef4444",
						borderTop: "1px solid #222222",
						borderRight: "1px solid #222222",
						borderBottom: "1px solid #222222",
					}}
				>
					{usersErrorMessage}
				</div>
			</div>
		);
	}

	if (!usersData) {
		return (
			<div
				className="min-h-screen p-6"
				style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
			>
				<div
					className="mx-auto max-w-7xl rounded-md p-4 text-sm"
					style={{
						backgroundColor: "#141414",
						color: "#71717a",
						border: "1px solid #222222",
					}}
				>
					No admin users found.
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
		>
			<div className="mx-auto max-w-7xl space-y-4">
				<PrUserSearchBar
					searchInput={searchInput}
					onSearchInputChange={handleSearchInputChange}
					onClear={handleSearchClear}
					isSearchLoading={searchInput !== debouncedSearch}
				/>

				<div className="flex items-center justify-between gap-3">
					<div>
						<h1
							style={{
								fontSize: "22px",
								fontWeight: 600,
								letterSpacing: "-0.02em",
								color: "#fafafa",
							}}
						>
							PR Admin Users
						</h1>
						<p style={{ fontSize: "12px", color: "#71717a" }}>
							Showing {rangeStart}-{rangeEnd} of {totalResults} users
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							refetchPrUsers();
						}}
						disabled={isUsersFetching}
						className="inline-flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						style={{
							backgroundColor: "#ffffff",
							color: "#000000",
							borderRadius: "10px",
							padding: "8px 16px",
							fontWeight: 500,
							transition: "opacity 0.2s ease",
							border: "1px solid #ffffff",
						}}
					>
						<RefreshCw
							size={16}
							strokeWidth={1.5}
							style={{ marginRight: "8px" }}
						/>
						{isUsersFetching ? "Refreshing..." : "Refresh"}
					</button>
				</div>

				<div
					style={{
						backgroundColor: "#111111",
						borderRadius: "20px",
						border: "1px solid #222222",
						overflow: "hidden",
					}}
				>
					<div className="overflow-x-auto">
						<table
							className="w-full min-w-max text-sm"
							style={{ color: "#fafafa", fontSize: "14px" }}
						>
							<thead style={{ backgroundColor: "#111111" }}>
								<tr>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										<span
											className="inline-flex items-center"
											style={{ gap: "6px" }}
										>
											<User size={14} strokeWidth={1.5} color="#71717a" />
											Full Name
										</span>
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										Email
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										Phone
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										<span
											className="inline-flex items-center"
											style={{ gap: "6px" }}
										>
											<Calendar size={14} strokeWidth={1.5} color="#71717a" />
											Events
										</span>
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										Workshops
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										<span
											className="inline-flex items-center"
											style={{ gap: "6px" }}
										>
											<Wallet size={14} strokeWidth={1.5} color="#71717a" />
											Paid
										</span>
									</th>
									<th
										className="px-3 py-3 text-left"
										style={{
											color: "#71717a",
											textTransform: "uppercase",
											fontSize: "12px",
											letterSpacing: "0.05em",
											fontWeight: 500,
										}}
									>
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{paginatedUsers.map((row) => (
									<tr
										key={row.id}
										className="border-t hover:bg-[#1a1a1a]"
										style={{
											borderColor: "#222222",
											backgroundColor: "#111111",
											transition: "background 0.2s ease",
										}}
									>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.fullname ?? "-"}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">{row.email}</td>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.phone ?? "-"}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.totalEvents}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.totalWorkshops}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											₹{(row.totalPaidAmount / 100).toFixed(2)}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() => {
														setSelectedUserId(row.id);
														setActiveTab("profile");
													}}
													className="inline-flex items-center text-sm"
													style={{
														backgroundColor: "transparent",
														color: "#fafafa",
														borderRadius: "8px",
														padding: "6px 12px",
														border: "1px solid #2a2a2a",
														transition: "all 0.2s ease",
													}}
												>
													<User
														size={16}
														strokeWidth={1.5}
														style={{ marginRight: 6 }}
													/>
													View
												</button>
												<button
													type="button"
													onClick={() => setSelectedOnboardingUserId(row.id)}
													className="inline-flex items-center text-sm"
													style={{
														backgroundColor: "#ffffff",
														color: "#000000",
														borderRadius: "8px",
														padding: "6px 12px",
														fontWeight: 500,
														border: "1px solid #ffffff",
														transition: "opacity 0.2s ease",
													}}
												>
													<DoorOpen
														size={16}
														strokeWidth={1.5}
														style={{ marginRight: 6 }}
													/>
													Onboarding
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{filteredUsers.length === 0 ? (
					<div
						className="rounded-md p-4 text-sm"
						style={{
							backgroundColor: "#141414",
							color: "#71717a",
							border: "1px solid #222222",
						}}
					>
						No user found.
					</div>
				) : null}

				<PrUsersPagination
					currentPage={safeCurrentPage}
					totalPages={totalPages}
					pageSize={pageSize}
					onPageSizeChange={handlePageSizeChange}
					onPrevious={() => setCurrentPage((value) => Math.max(1, value - 1))}
					onNext={() =>
						setCurrentPage((value) => Math.min(totalPages, value + 1))
					}
				/>
			</div>

			{selectedUserId ? (
				<PrUserDetailsModal
					onClose={() => setSelectedUserId(null)}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					data={detailsData?.data}
					isLoading={isDetailsLoading}
					isError={isDetailsError}
				/>
			) : null}

			<OnboardingModal
				open={Boolean(selectedOnboardingUserId)}
				userId={selectedOnboardingUserId}
				onClose={() => setSelectedOnboardingUserId(null)}
			/>
		</div>
	);
}
