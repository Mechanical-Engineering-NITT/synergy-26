import { createFileRoute } from "@tanstack/react-router";
import { enforceAdminAccess } from "@/lib/utils";
import { getAdminReportingDataForPages } from "@/server/admin";

export const Route = createFileRoute("/pr/")({
	loader: async () => {
		await enforceAdminAccess();
		const reportingData = await getAdminReportingDataForPages();
		return reportingData.prDataset;
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
					<table className="min-w-full text-sm">
						<thead className="bg-muted/40">
							<tr>
								{prDataset.columns.map((column) => (
									<th
										key={column}
										className="px-3 py-2 text-left font-medium whitespace-nowrap"
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
									{row.map((cell, cellIndex) => (
										<td
											key={`${row[0]}-${cellIndex}`}
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
			</div>
		</div>
	);
}
