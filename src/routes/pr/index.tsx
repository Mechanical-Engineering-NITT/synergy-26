import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					Loading admin users...
				</div>
			</div>
		);
	}

	if (isUsersError) {
		return (
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					{usersErrorMessage}
				</div>
			</div>
		);
	}

	if (!usersData) {
		return (
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					No admin users found.
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground p-6">
			<div className="mx-auto max-w-7xl space-y-4">
				<PrUserSearchBar
					searchInput={searchInput}
					onSearchInputChange={handleSearchInputChange}
					onClear={handleSearchClear}
					isSearchLoading={searchInput !== debouncedSearch}
				/>

				<div className="flex items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold">PR Admin Users</h1>
						<p className="text-sm text-muted-foreground">
							Showing {rangeStart}-{rangeEnd} of {totalResults} users
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							refetchPrUsers();
						}}
						disabled={isUsersFetching}
						className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isUsersFetching ? "Refreshing..." : "Refresh"}
					</button>
				</div>

				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="w-full min-w-max text-sm">
						<thead className="bg-muted/40">
							<tr>
								<th className="px-3 py-2 text-left font-medium">Full Name</th>
								<th className="px-3 py-2 text-left font-medium">Email</th>
								<th className="px-3 py-2 text-left font-medium">Phone</th>
								<th className="px-3 py-2 text-left font-medium">
									Total Events Registered
								</th>
								<th className="px-3 py-2 text-left font-medium">
									Total Workshops Registered
								</th>
								<th className="px-3 py-2 text-left font-medium">
									Total Paid Amount
								</th>
								<th className="px-3 py-2 text-left font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{paginatedUsers.map((row) => (
								<tr key={row.id} className="border-t border-border">
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
												className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
											>
												View
											</button>
											<button
												type="button"
												onClick={() => setSelectedOnboardingUserId(row.id)}
												className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
											>
												Onboarding
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filteredUsers.length === 0 ? (
					<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
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

			{selectedOnboardingUserId ? (
				<OnboardingModal
					userId={selectedOnboardingUserId}
					onClose={() => setSelectedOnboardingUserId(null)}
				/>
			) : null}
		</div>
	);
}
