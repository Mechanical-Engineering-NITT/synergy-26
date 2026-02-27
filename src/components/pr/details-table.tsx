export function SimpleDetailsTable({
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
					{rows.map((row, rowIndex) => (
						<tr
							key={`${rowIndex}-${row.map((value) => String(value)).join("|")}`}
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
