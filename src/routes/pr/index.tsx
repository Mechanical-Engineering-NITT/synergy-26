import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cn, requireAdminUser } from "@/lib/utils";
import { getPRData, prHeaderRow } from "@/server/admin/admin.pr";

const prDataQueryOptions = queryOptions({
	queryKey: ["pr", "dataset"],
	queryFn: () => getPRData(),
});

export const Route = createFileRoute("/pr/")({
	loader: async () => {
		await requireAdminUser(["ADMIN-PR", "ADMIN-MASTER"]);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: prData, isLoading, isError } = useQuery(prDataQueryOptions);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					Loading PR dataset...
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					Failed to load PR dataset.
				</div>
			</div>
		);
	}

	if (!prData) {
		return (
			<div className="min-h-screen bg-background text-foreground p-6">
				<div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
					No PR dataset found.
				</div>
			</div>
		);
	}

	const rows = prData.data.rows;

	const eventIds = Array.from(
		new Set(rows.flatMap((row) => Object.keys(row.events).map(Number))),
	).sort((a, b) => a - b);

	const workshopIds = Array.from(
		new Set(rows.flatMap((row) => Object.keys(row.workshops).map(Number))),
	).sort((a, b) => a - b);

	const profileColumns = ["User ID", "Email", "Full Name", "Phone"];
	const eventColumns = eventIds.map(
		(eventId) => prData.data.eventMeta[eventId] ?? `Event ${eventId}`,
	);
	const workshopColumns = workshopIds.map(
		(workshopId) =>
			prData.data.workshopMeta[workshopId] ?? `Workshop ${workshopId}`,
	);

	const columns = [...profileColumns, ...eventColumns, ...workshopColumns];
	const profileColumnCount = profileColumns.length;
	const eventColumnCount = eventColumns.length;
	const workshopColumnCount = workshopColumns.length;

	const tableRows = rows.map((row) => [
		row.userId,
		row.email,
		row.fullname ?? "",
		row.phone ?? "",
		...eventIds.map((eventId) => (row.events[eventId] ? "yes" : "no")),
		...workshopIds.map((workshopId) =>
			row.workshops[workshopId] ? "yes" : "no",
		),
	]);

	return (
		<div className="min-h-screen bg-background text-foreground p-6">
			<div className="mx-auto max-w-7xl">
				<h1 className="text-2xl font-semibold mb-4">PR Dataset</h1>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="w-full min-w-max text-sm">
						<thead className="bg-muted/40">
							<tr>
								<th
									colSpan={profileColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-r border-border"
								>
									{prHeaderRow[0]?.toUpperCase()}
								</th>
								<th
									colSpan={eventColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-r border-border"
								>
									{prHeaderRow[1]?.toUpperCase()}
								</th>
								<th
									colSpan={workshopColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-border"
								>
									{prHeaderRow[2]?.toUpperCase()}
								</th>
							</tr>
							<tr>
								{columns.map((column) => (
									<th
										key={column}
										className="px-3 py-2 text-left font-medium whitespace-nowrap border-b border-r border-border"
									>
										{column}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{tableRows.map((row, rowIndex) => (
								<tr
									key={`${row[0]}-${rowIndex}`}
									className="border-t border-border"
								>
									{row.map((cell, cellIndex) => {
										const cellText = String(cell).toLowerCase();
										const isPaymentCell = cellIndex >= profileColumnCount;
										const isYes = isPaymentCell && cellText === "yes";
										const isNo = isPaymentCell && cellText === "no";

										return (
											<td
												key={`${row[0]}-${cellIndex}`}
												className={cn(
													"px-3 py-2 whitespace-nowrap border-r border-border",
													isYes &&
														"bg-green-500/15 text-green-700 dark:text-green-300",
													isNo &&
														"bg-red-500/15 text-red-700 dark:text-red-300",
												)}
											>
												{String(cell)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
