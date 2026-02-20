import { createFileRoute } from "@tanstack/react-router";
import { cn, enforceAdminAccess } from "@/lib/utils";
import { getPrDatasetForPage } from "@/server/admin";

export const Route = createFileRoute("/pr/")({
	loader: async () => {
		await enforceAdminAccess();
		return getPrDatasetForPage();
	},
	component: RouteComponent,
});

function RouteComponent() {
	const prDataset = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-background text-foreground p-6">
			<div className="mx-auto max-w-7xl">
				<h1 className="text-2xl font-semibold mb-4">PR Dataset</h1>
				<div className="overflow-x-auto rounded-md border border-border bg-card">
					<table className="w-full min-w-max text-sm">
						<thead className="bg-muted/40">
							<tr>
								<th
									colSpan={prDataset.profileColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-r border-border"
								>
									PROFILE
								</th>
								<th
									colSpan={prDataset.eventColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-r border-border"
								>
									EVENTS
								</th>
								<th
									colSpan={prDataset.workshopColumnCount}
									className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-border"
								>
									WORKSHOPS
								</th>
							</tr>
							<tr>
								{prDataset.columns.map((column) => (
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
							{prDataset.rows.map((row, rowIndex) => (
								<tr
									key={`${row[0]}-${rowIndex}`}
									className="border-t border-border"
								>
									{row.map((cell, cellIndex) => {
										const cellText = String(cell).toLowerCase();
										const isPaymentCell =
											cellIndex >= prDataset.profileColumnCount;
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
