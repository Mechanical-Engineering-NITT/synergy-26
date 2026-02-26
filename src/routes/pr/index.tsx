import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { requireAdminUser } from "@/lib/utils";
import {
	getPaginatedUserDetails,
	getPaginatedUsers,
} from "@/server/admin/admin.pr";

const PAGE_SIZE = 20;

const adminUsersQueryOptions = (page: number, limit: number) =>
	queryOptions({
		queryKey: ["admin", "pr", "users", page, limit],
		queryFn: () => getPaginatedUsers({ data: { page, limit } }),
	});

const adminUserDetailsQueryOptions = (userId: string) =>
	queryOptions({
		queryKey: ["admin", "pr", "user-details", userId],
		queryFn: () => getPaginatedUserDetails({ data: { userId } }),
		enabled: userId.length > 0,
	});

export const Route = createFileRoute("/pr/")({
	validateSearch: (search: { page?: unknown; limit?: unknown } | undefined) => {
		const pageValue = Number(search?.page);
		const limitValue = Number(search?.limit);

		const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
		const limit =
			Number.isFinite(limitValue) && limitValue > 0 && limitValue <= 100
				? limitValue
				: PAGE_SIZE;

		return { page, limit };
	},
	loaderDeps: ({ search }) => ({
		page: search.page,
		limit: search.limit,
	}),
	loader: async ({ deps }) => {
		await requireAdminUser({ data: { roles: ["ADMIN-PR", "ADMIN-MASTER"] } });
		const page = deps.page;
		const limit = deps.limit;
		const initialUsers = await getPaginatedUsers({
			data: { page, limit },
		});

		return {
			initialUsers,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { initialUsers } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const page = search?.page ?? 1;
	const limit = search?.limit ?? PAGE_SIZE;
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("profile");

	const {
		data: usersData,
		isLoading: isUsersLoading,
		isError: isUsersError,
	} = useQuery({
		...adminUsersQueryOptions(page, limit),
		initialData:
			page === initialUsers.data.pagination.page &&
			limit === initialUsers.data.pagination.limit
				? initialUsers
				: undefined,
	});

	const {
		data: detailsData,
		isLoading: isDetailsLoading,
		isError: isDetailsError,
	} = useQuery({
		...adminUserDetailsQueryOptions(selectedUserId ?? ""),
	});

	const rows = usersData?.data.rows ?? [];
	const pagination = usersData?.data.pagination;

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
					Failed to load admin users.
				</div>
			</div>
		);
	}

	if (!usersData || !pagination) {
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
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-2xl font-semibold">PR Admin Users</h1>
					<p className="text-sm text-muted-foreground">
						Page {pagination.page} of {pagination.totalPages}
					</p>
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
							{rows.map((row) => (
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

				<div className="flex items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						{pagination.totalUsers} users total
					</p>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() =>
								navigate({
									search: {
										page: Math.max(1, page - 1),
										limit,
									},
								})
							}
							disabled={page <= 1}
							className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							type="button"
							onClick={() =>
								navigate({
									search: {
										page: Math.min(pagination.totalPages, page + 1),
										limit,
									},
								})
							}
							disabled={page >= pagination.totalPages}
							className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			</div>

			{selectedUserId ? (
				<AdminUserDetailsModal
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

function AdminUserDetailsModal({
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
						<AdminUserDetailsTabs activeTab={activeTab} data={data} />
					) : null}
				</div>
			</div>
		</div>
	);
}

function AdminUserDetailsTabs({
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
