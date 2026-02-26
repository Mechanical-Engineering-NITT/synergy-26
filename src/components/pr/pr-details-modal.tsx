import { PrUserDetailsTabs } from "@/components/pr/pr-details-tabs";

export function PrUserDetailsModal({
	onClose,
	activeTab,
	setActiveTab,
	data,
	isLoading,
	isError,
}: {
	onClose: () => void;
	activeTab: string;
	setActiveTab: (value: string) => void;
	data: Record<string, unknown> | undefined;
	isLoading: boolean;
	isError: boolean;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-5xl rounded-md border border-border bg-background shadow-lg">
				<div className="flex items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-lg font-semibold">User Details</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md border border-border px-2 py-1 text-sm hover:bg-muted"
					>
						Close
					</button>
				</div>

				<div className="border-b border-border px-4 py-2">
					<div className="flex flex-wrap gap-2">
						{["profile", "events", "workshops", "payments"].map((tab) => (
							<button
								type="button"
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`rounded-md px-3 py-1.5 text-sm capitalize ${
									activeTab === tab
										? "bg-primary text-primary-foreground"
										: "border border-border hover:bg-muted"
								}`}
							>
								{tab}
							</button>
						))}
					</div>
				</div>

				<div className="max-h-[70vh] overflow-auto p-4">
					{isLoading ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Loading user details...
						</div>
					) : null}

					{isError ? (
						<div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
							Failed to load user details.
						</div>
					) : null}

					{!isLoading && !isError && data ? (
						<PrUserDetailsTabs activeTab={activeTab} data={data} />
					) : null}
				</div>
			</div>
		</div>
	);
}
