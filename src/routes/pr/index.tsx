import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
		await requireAdminUser({ data: { roles: ["ADMIN-PR", "ADMIN-MASTER"] } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	Route.useLoaderData();
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
		</div>
	);
}

function PrUserSearchBar({
	searchInput,
	onSearchInputChange,
	onClear,
	isSearchLoading,
}: {
	searchInput: string;
	onSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onClear: () => void;
	isSearchLoading: boolean;
}) {
	return (
		<div className="rounded-md border border-border bg-card p-3">
			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<input
					type="text"
					value={searchInput}
					onChange={onSearchInputChange}
					placeholder="Search by email"
					maxLength={200}
					className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
				/>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{isSearchLoading ? "Searching..." : "Type to search"}
					</span>
					<button
						type="button"
						onClick={onClear}
						disabled={searchInput.length === 0}
						className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Clear
					</button>
				</div>
			</div>
		</div>
	);
}

function PrUsersPagination({
	currentPage,
	totalPages,
	pageSize,
	onPageSizeChange,
	onPrevious,
	onNext,
}: {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	onPageSizeChange: (value: number) => void;
	onPrevious: () => void;
	onNext: () => void;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Page size:</span>
				<select
					value={String(pageSize)}
					onChange={(event) => onPageSizeChange(Number(event.target.value))}
					className="h-8 rounded-md border border-border bg-background px-2 text-sm"
				>
					<option value="10">10</option>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="100">100</option>
				</select>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-sm text-muted-foreground">
					Page {currentPage} of {totalPages}
				</span>
				<button
					type="button"
					onClick={onPrevious}
					disabled={currentPage <= 1}
					className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={currentPage >= totalPages}
					className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>
		</div>
	);
}

function PrUserDetailsModal({
	onClose,
	activeTab,
	setActiveTab,
	data,
	isLoading,
	isError,
}: {
	onClose: () => void;
	activeTab: string;
	setActiveTab: (value: string) => void;
	data: Record<string, unknown> | undefined;
	isLoading: boolean;
	isError: boolean;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-5xl rounded-md border border-border bg-background shadow-lg">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">User Details</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
					>
						Close
					</button>
				</div>

				<div className="border-b border-border px-4 py-2">
					<div className="flex flex-wrap gap-2">
						{["profile", "events", "workshops", "payments"].map((tab) => (
							<button
								type="button"
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`rounded-md px-3 py-1.5 text-sm capitalize ${
									activeTab === tab
										? "bg-primary text-primary-foreground"
										: "border border-border hover:bg-muted"
								}`}
							>
								{tab}
							</button>
						))}
					</div>
				</div>

				<div className="max-h-[70vh] overflow-auto p-4">
					{isLoading ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Loading user details...
						</div>
					) : null}

					{isError ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Failed to load user details.
						</div>
					) : null}

					{!isLoading && !isError && data ? (
						<PrUserDetailsTabs activeTab={activeTab} data={data} />
					) : null}
				</div>
			</div>
		</div>
	);
}

function PrUserDetailsTabs({
	activeTab,
	data,
}: {
	activeTab: string;
	data: Record<string, unknown>;
}) {
	const profile = (data.profile as Record<string, unknown> | undefined) ?? {};
	const eventRows =
		(data.events as Array<Record<string, unknown>> | undefined) ?? [];
	const workshopRows =
		(data.workshops as Array<Record<string, unknown>> | undefined) ?? [];
	const paymentRows =
		(data.payments as Array<Record<string, unknown>> | undefined) ?? [];

	if (activeTab === "profile") {
		return (
			<div className="overflow-x-auto rounded-md border border-border bg-card">
				<table className="min-w-full text-sm">
					<thead className="bg-muted/40">
						<tr>
							<th className="px-3 py-2 text-left font-medium">User ID</th>
							<th className="px-3 py-2 text-left font-medium">Full Name</th>
							<th className="px-3 py-2 text-left font-medium">Email</th>
							<th className="px-3 py-2 text-left font-medium">Phone</th>
						</tr>
					</thead>
					<tbody>
						<tr className="border-t border-border">
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.id ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.fullname ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.email ?? "-")}
							</td>
							<td className="px-3 py-2 whitespace-nowrap">
								{String(profile.phone ?? "-")}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	if (activeTab === "events") {
		return (
			<SimpleDetailsTable
				headers={["Event ID", "Event Title", "Payment Status", "Created At"]}
				rows={eventRows.map((eventRow) => [
					Number(eventRow.eventId ?? 0) || "-",
					String(eventRow.eventTitle ?? "-"),
					String(eventRow.paymentStatus ?? "-"),
					eventRow.createdAt
						? new Date(String(eventRow.createdAt)).toLocaleString()
						: "-",
				])}
				emptyLabel="No event registrations found."
			/>
		);
	}

	if (activeTab === "workshops") {
		return (
			<SimpleDetailsTable
				headers={[
					"Workshop ID",
					"Workshop Title",
					"Payment Status",
					"Created At",
				]}
				rows={workshopRows.map((workshopRow) => [
					Number(workshopRow.workshopId ?? 0) || "-",
					String(workshopRow.workshopTitle ?? "-"),
					String(workshopRow.paymentStatus ?? "-"),
					workshopRow.createdAt
						? new Date(String(workshopRow.createdAt)).toLocaleString()
						: "-",
				])}
				emptyLabel="No workshop registrations found."
			/>
		);
	}

	return (
		<SimpleDetailsTable
			headers={["Payment ID", "Amount", "Status", "Created At"]}
			rows={paymentRows.map((paymentRow) => [
				String(paymentRow.id ?? "-"),
				`₹${(Number(paymentRow.amount ?? 0) / 100).toFixed(2)}`,
				String(paymentRow.status ?? "-"),
				paymentRow.createdAt
					? new Date(String(paymentRow.createdAt)).toLocaleString()
					: "-",
			])}
			emptyLabel="No payments found."
		/>
	);
}

function SimpleDetailsTable({
	headers,
	rows,
	emptyLabel,
}: {
	headers: string[];
	rows: Array<Array<string | number>>;
	emptyLabel: string;
}) {
	if (rows.length === 0) {
		return (
			<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
				{emptyLabel}
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-md border border-border bg-card">
			<table className="min-w-full text-sm">
				<thead className="bg-muted/40">
					<tr>
						{headers.map((header) => (
							<th key={header} className="px-3 py-2 text-left font-medium">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.map((value) => String(value)).join("|")}
							className="border-t border-border"
						>
							{row.map((cell, cellIndex) => (
								<td
									key={`${headers[cellIndex] ?? "col"}-${String(cell)}`}
									className="px-3 py-2 whitespace-nowrap"
								>
									{String(cell)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
