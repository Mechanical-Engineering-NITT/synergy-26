import type { ChangeEvent } from "react";

export function PrUserSearchBar({
	searchInput,
	onSearchInputChange,
	onClear,
	isSearchLoading,
}: {
	searchInput: string;
	onSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
