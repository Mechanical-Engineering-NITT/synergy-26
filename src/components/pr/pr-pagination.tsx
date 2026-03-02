export function PrUsersPagination({
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
		<div
			className="flex flex-col gap-3 rounded-md p-3 md:flex-row md:items-center md:justify-between"
			style={{
				backgroundColor: "#111111",
				color: "#fafafa",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<div
				className="flex items-center gap-2 text-sm"
				style={{ color: "#a1a1aa" }}
			>
				<span>Page size:</span>
				<select
					value={String(pageSize)}
					onChange={(event) => onPageSizeChange(Number(event.target.value))}
					className="h-8 text-xs"
					style={{
						backgroundColor: "#0f0f0f",
						border: "1px solid #222222",
						borderRadius: "10px",
						padding: "8px 12px",
						color: "#fafafa",
						transition: "all 0.2s ease",
					}}
				>
					<option value="10">10</option>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="100">100</option>
				</select>
			</div>

			<div className="flex items-center gap-3">
				<span style={{ fontSize: "12px", color: "#71717a" }}>
					Page {currentPage} of {totalPages}
				</span>
				<button
					type="button"
					onClick={onPrevious}
					disabled={currentPage <= 1}
					className="text-sm disabled:cursor-not-allowed"
					style={{
						backgroundColor: "transparent",
						color: currentPage <= 1 ? "#71717a" : "#fafafa",
						borderRadius: "10px",
						padding: "8px 16px",
						border: "1px solid #2a2a2a",
						transition: "all 0.2s ease",
					}}
				>
					Previous
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={currentPage >= totalPages}
					className="text-sm disabled:cursor-not-allowed"
					style={{
						backgroundColor: currentPage >= totalPages ? "#141414" : "#ffffff",
						color: currentPage >= totalPages ? "#71717a" : "#000000",
						borderRadius: "10px",
						padding: "8px 16px",
						fontWeight: 500,
						border:
							currentPage >= totalPages
								? "1px solid #2a2a2a"
								: "1px solid #ffffff",
						transition: "opacity 0.2s ease",
					}}
				>
					Next
				</button>
			</div>
		</div>
	);
}
