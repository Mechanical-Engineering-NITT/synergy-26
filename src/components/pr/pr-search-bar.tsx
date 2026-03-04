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
		<div
			className="rounded-md p-3"
			style={{
				backgroundColor: "#111111",
				color: "#fafafa",
				border: "1px solid #222222",
				transition: "all 0.2s ease",
			}}
		>
			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<input
					type="text"
					value={searchInput}
					onChange={onSearchInputChange}
					placeholder="Search by Synergy ID"
					maxLength={200}
					className="h-9 flex-1 text-sm"
					style={{
						backgroundColor: "#0f0f0f",
						border: "1px solid #222222",
						borderRadius: "10px",
						padding: "8px 12px",
						color: "#fafafa",
						fontSize: "14px",
						transition: "all 0.2s ease",
					}}
				/>
				<div className="flex items-center gap-2">
					<span style={{ fontSize: "12px", color: "#71717a" }}>
						{isSearchLoading ? "Searching..." : "Type to search"}
					</span>
					<button
						type="button"
						onClick={onClear}
						disabled={searchInput.length === 0}
						className="text-sm disabled:cursor-not-allowed"
						style={{
							backgroundColor: "transparent",
							color: searchInput.length === 0 ? "#71717a" : "#fafafa",
							borderRadius: "10px",
							padding: "8px 16px",
							border: "1px solid #2a2a2a",
							transition: "all 0.2s ease",
						}}
					>
						Clear
					</button>
				</div>
			</div>
		</div>
	);
}
