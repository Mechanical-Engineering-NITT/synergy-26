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
