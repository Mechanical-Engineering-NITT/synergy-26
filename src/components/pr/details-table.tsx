import type { ReactNode } from "react";

export function SimpleDetailsTable({
	headers,
	rows,
	emptyLabel,
}: {
	headers: string[];
	rows: Array<Array<ReactNode>>;
	emptyLabel: string;
}) {
	if (rows.length === 0) {
		return (
			<div
				className="rounded-md p-4 text-sm"
				style={{
					backgroundColor: "#141414",
					color: "#71717a",
					border: "1px solid #222222",
					transition: "all 0.2s ease",
				}}
			>
				{emptyLabel}
			</div>
		);
	}

	return (
		<div
			style={{
				backgroundColor: "#111111",
				borderRadius: "20px",
				border: "1px solid #222222",
				overflow: "hidden",
				transition: "all 0.2s ease",
			}}
		>
			<div className="overflow-x-auto">
				<table
					className="min-w-full text-sm"
					style={{ color: "#fafafa", fontSize: "14px" }}
				>
					<thead style={{ backgroundColor: "#111111" }}>
						<tr>
							{headers.map((header) => (
								<th
									key={header}
									className="px-3 py-3 text-left"
									style={{
										color: "#71717a",
										textTransform: "uppercase",
										fontSize: "12px",
										letterSpacing: "0.05em",
										fontWeight: 500,
									}}
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr
								key={`row-${row
									.map((cell, cellIndex) => {
										if (typeof cell === "string" || typeof cell === "number") {
											return String(cell);
										}

										return `node-${cellIndex}`;
									})
									.join("|")}`}
								className="border-t hover:bg-[#1a1a1a]"
								style={{
									borderColor: "#222222",
									backgroundColor: "#111111",
									transition: "background 0.2s ease",
								}}
							>
								{row.map((cell, cellIndex) => (
									<td
										key={`${headers[cellIndex] ?? "col"}-${cellIndex}`}
										className="px-3 py-2 whitespace-nowrap"
									>
										{cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
