import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Banknote,
	Calendar,
	Hash,
	Info,
	Phone,
	RefreshCw,
	User,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { PrUsersPagination } from "@/components/pr/pr-pagination";
import { requireAdminUser } from "@/lib/utils";
import { type GajanaTransaction, getGajanaData } from "@/server/admin/pr/query";

const DEFAULT_PAGE_SIZE = 25;

const prGajanaQueryOptions = () =>
	queryOptions({
		queryKey: ["pr-gajana"],
		queryFn: () => getGajanaData(),
		refetchInterval: false,
		refetchOnWindowFocus: false,
	});

export const Route = createFileRoute("/pr/gajana")({
	loader: async () => {
		await requireAdminUser({ data: { roles: ["PR", "MASTER", "ADMIN"] } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const {
		data: queryData,
		isLoading,
		isError,
		isFetching,
		error,
		refetch,
	} = useQuery({
		...prGajanaQueryOptions(),
	});

	const handlePageSizeChange = useCallback((value: number) => {
		setPageSize(value);
		setCurrentPage(1);
	}, []);

	const rows = queryData?.data.rows ?? [];
	const totalAmount = queryData?.data.totalAmount ?? 0;

	const totalResults = rows.length;
	const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
	const safeCurrentPage = Math.min(currentPage, totalPages);

	const paginatedRows = useMemo(() => {
		const start = (safeCurrentPage - 1) * pageSize;
		return rows.slice(start, start + pageSize);
	}, [rows, safeCurrentPage, pageSize]);

	const rangeStart =
		totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
	const rangeEnd = Math.min(safeCurrentPage * pageSize, totalResults);
	const errorMessage =
		error instanceof Error ? error.message : "Failed to load Gajana data.";

	if (isLoading) {
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
					Loading Gajana data...
				</div>
			</div>
		);
	}

	if (isError) {
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
					{errorMessage}
				</div>
			</div>
		);
	}

	if (!queryData) {
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
					No Gajana data found.
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "#0a0a0a", color: "#fafafa" }}
		>
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1
							style={{
								fontSize: "22px",
								fontWeight: 600,
								letterSpacing: "-0.02em",
								color: "#fafafa",
							}}
						>
							PR Desk Financials (Gajana)
						</h1>
						<p style={{ fontSize: "12px", color: "#71717a" }}>
							Overview of money physically present at the PR desk
						</p>
					</div>
					<button
						type="button"
						onClick={() => {
							refetch();
						}}
						disabled={isFetching}
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
						{isFetching ? "Refreshing..." : "Refresh"}
					</button>
				</div>

				{/* Summary Card */}
				<div
					className="rounded-xl p-6"
					style={{
						backgroundColor: "#111111",
						border: "1px solid #222222",
					}}
				>
					<h2
						style={{
							fontSize: "14px",
							fontWeight: 500,
							color: "#a1a1aa",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							marginBottom: "8px",
						}}
					>
						Total Cash Present
					</h2>
					<div
						className="flex items-end gap-2"
						style={{ color: "#10b981", fontWeight: 700 }}
					>
						<span style={{ fontSize: "36px", lineHeight: 1 }}>
							₹{totalAmount.toLocaleString("en-IN")}
						</span>
					</div>
					<p
						style={{ fontSize: "12px", color: "#71717a", marginTop: "12px" }}
						className="leading-relaxed"
					>
						Calculation includes: Accomms fee and paid caution deposits (minus
						returned ones), and onspot event pass or workshop registrations.
					</p>
				</div>

				<div className="flex items-center justify-between">
					<p style={{ fontSize: "14px", color: "#fafafa", fontWeight: 500 }}>
						Transaction Breakdown
					</p>
					<p style={{ fontSize: "12px", color: "#71717a" }}>
						Showing {rangeStart}-{rangeEnd} of {totalResults} entries
					</p>
				</div>

				{/* Transactions Table */}
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<Banknote size={14} className="text-[#71717a]" />
											AMOUNT
										</div>
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<Info size={14} className="text-[#71717a]" />
											TYPE
										</div>
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<Hash size={14} className="text-[#71717a]" />
											SYNERGY ID
										</div>
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<User size={14} className="text-[#71717a]" />
											FULL NAME
										</div>
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<Phone size={14} className="text-[#71717a]" />
											PHONE
										</div>
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
										<div className="flex items-center gap-2 text-xs tracking-wide text-[#71717a]">
											<Calendar size={14} className="text-[#71717a]" />
											DATE & TIME
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{paginatedRows.map((row: GajanaTransaction, index: number) => (
									<tr
										// eslint-disable-next-line react/no-array-index-key
										key={`${row.id}-${row.type}-${index}`}
										className="border-t hover:bg-[#1a1a1a]"
										style={{
											borderColor: "#222222",
											backgroundColor: "#111111",
											transition: "background 0.2s ease",
										}}
									>
										<td
											className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-left"
											style={{ color: row.amount >= 0 ? "#10b981" : "#ef4444" }}
										>
											{row.amount >= 0 ? "+" : "-"}₹{Math.abs(row.amount)}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											<span
												className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
												style={{
													backgroundColor:
														row.type === "ACCOMMODATION_FEE" ||
														row.type === "CAUTION_DEPOSIT" ||
														row.type === "CAUTION_RETURNED"
															? "rgba(168, 85, 247, 0.15)"
															: "rgba(59, 130, 246, 0.15)",
													color:
														row.type === "ACCOMMODATION_FEE" ||
														row.type === "CAUTION_DEPOSIT" ||
														row.type === "CAUTION_RETURNED"
															? "#c084fc"
															: "#60a5fa",
												}}
											>
												{row.type === "ACCOMMODATION_FEE"
													? "Accommodation Fee"
													: row.type === "CAUTION_DEPOSIT"
														? "Caution Deposit"
														: row.type === "CAUTION_RETURNED"
															? "Caution Deposit Returned"
															: row.type === "ONSPOT_EVENT_PASS"
																? "Onspot Event Pass"
																: "Onspot Workshop"}
											</span>
										</td>
										<td className="px-3 py-2 whitespace-nowrap text-sm text-[#fafafa] font-medium text-left">
											{row.synergyId ?? "-"}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.fullname ?? "-"}
										</td>
										<td className="px-3 py-2 whitespace-nowrap">
											{row.phone ?? "-"}
										</td>
										<td
											className="px-3 py-2 whitespace-nowrap text-xs"
											style={{ color: "#a1a1aa" }}
										>
											{row.createdAt
												? new Date(row.createdAt).toLocaleString("en-IN", {
														dateStyle: "medium",
														timeStyle: "short",
													})
												: "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{rows.length === 0 ? (
					<div
						className="rounded-md p-4 text-sm"
						style={{
							backgroundColor: "#141414",
							color: "#71717a",
							border: "1px solid #222222",
						}}
					>
						No transactions found.
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
		</div>
	);
}
