import { Bed, Calendar, Receipt, User } from "lucide-react";
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
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(10,10,10,0.8)" }}
		>
			<div
				className="w-full max-w-5xl"
				style={{
					backgroundColor: "#111111",
					borderRadius: "24px",
					border: "1px solid #222222",
					padding: "28px",
					boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
				}}
			>
				<div
					className="flex items-center justify-between"
					style={{
						borderBottom: "1px solid #1f1f1f",
						paddingBottom: "16px",
						marginBottom: "16px",
					}}
				>
					<h2
						className="inline-flex items-center"
						style={{
							fontSize: "22px",
							fontWeight: 600,
							letterSpacing: "-0.02em",
							color: "#fafafa",
							gap: "8px",
						}}
					>
						<Receipt size={20} strokeWidth={1.5} color="#a1a1aa" />
						User Details
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-sm"
						style={{
							backgroundColor: "transparent",
							color: "#fafafa",
							borderRadius: "10px",
							padding: "8px 16px",
							border: "1px solid #2a2a2a",
							transition: "all 0.2s ease",
						}}
					>
						Close
					</button>
				</div>

				<div
					style={{
						borderBottom: "1px solid #1f1f1f",
						paddingBottom: "16px",
						marginBottom: "16px",
					}}
				>
					<div
						className="inline-flex flex-wrap gap-2"
						style={{
							backgroundColor: "#141414",
							borderRadius: "999px",
							padding: "4px",
						}}
					>
						{[
							{ key: "profile", label: "profile", icon: User },
							{ key: "events", label: "events", icon: Calendar },
							{ key: "workshops", label: "workshops", icon: Bed },
							{ key: "payments", label: "payments", icon: Receipt },
						].map((tab) => (
							<button
								type="button"
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className="relative inline-flex items-center rounded-md px-3 py-1.5 text-sm capitalize"
								style={{
									backgroundColor:
										activeTab === tab.key ? "#1f1f1f" : "transparent",
									color: activeTab === tab.key ? "#ffffff" : "#71717a",
									border:
										activeTab === tab.key
											? "1px solid #2a2a2a"
											: "1px solid transparent",
									transition: "all 0.2s ease",
								}}
							>
								<tab.icon
									size={16}
									strokeWidth={1.5}
									color="#a1a1aa"
									style={{ marginRight: "8px" }}
								/>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				<div
					className="max-h-[70vh] overflow-auto"
					style={{ fontSize: "14px" }}
				>
					{isLoading ? (
						<div
							className="rounded-md p-4 text-sm"
							style={{
								backgroundColor: "#141414",
								color: "#71717a",
								border: "1px solid #222222",
							}}
						>
							Loading user details...
						</div>
					) : null}

					{isError ? (
						<div
							className="rounded-md p-4 text-sm"
							style={{
								backgroundColor: "#141414",
								color: "#ef4444",
								borderLeft: "3px solid #ef4444",
								borderTop: "1px solid #222222",
								borderRight: "1px solid #222222",
								borderBottom: "1px solid #222222",
							}}
						>
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
