type WorkshopOption = {
	id: number;
	title: string;
	price: number;
};

const formatCurrency = (amount: number) =>
	`₹${amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})}`;

export function Step1Selection({
	workshops,
	selectedWorkshops,
	existingWorkshopRegistrations,
	hasExistingWorkshopRegistrations,
	eventPassPrice,
	eventPassSelected,
	onToggleWorkshop,
	onToggleEventPass,
}: {
	workshops: WorkshopOption[];
	selectedWorkshops: number[];
	existingWorkshopRegistrations: number[];
	hasExistingWorkshopRegistrations: boolean;
	eventPassPrice: number;
	eventPassSelected: boolean;
	onToggleWorkshop: (workshopId: number) => void;
	onToggleEventPass: (value: boolean) => void;
}) {
	const eventPassDisabled =
		hasExistingWorkshopRegistrations || selectedWorkshops.length > 0;

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-[#fafafa]">
				1. Selection (Workshops + Event Pass)
			</h4>

			<div className="space-y-2 rounded-md border border-[#222222] bg-[#111111] p-3">
				<p className="text-xs text-[#71717a]">Workshops</p>
				{workshops.map((workshop) => {
					const alreadyRegistered = existingWorkshopRegistrations.includes(
						workshop.id,
					);

					return (
						<label
							key={workshop.id}
							className={`flex items-center justify-between rounded-md border border-[#222222] bg-[#0d0d0d] px-3 py-2 text-sm ${
								alreadyRegistered
									? "cursor-not-allowed opacity-60"
									: "cursor-pointer"
							}`}
						>
							<span className="inline-flex items-center gap-2 text-[#fafafa]">
								<input
									type="checkbox"
									checked={selectedWorkshops.includes(workshop.id)}
									disabled={alreadyRegistered}
									onChange={() => onToggleWorkshop(workshop.id)}
									className="h-4 w-4 rounded border-[#2a2a2a] bg-transparent"
								/>
								{workshop.title}
								{alreadyRegistered ? (
									<span className="text-xs text-[#a1a1aa]">
										(Already Registered)
									</span>
								) : null}
							</span>
							<span className="text-[#a1a1aa]">
								{formatCurrency(workshop.price)}
							</span>
						</label>
					);
				})}
			</div>

			<div className="space-y-2 rounded-md border border-[#222222] bg-[#111111] p-3">
				<p className="text-xs text-[#71717a]">Event Pass</p>
				<label
					className={`flex items-center justify-between rounded-md border border-[#222222] bg-[#0d0d0d] px-3 py-2 text-sm transition-opacity duration-200 ${
						eventPassDisabled
							? "cursor-not-allowed opacity-60"
							: "cursor-pointer"
					}`}
				>
					<span className="inline-flex items-center gap-2 text-[#fafafa]">
						<input
							type="checkbox"
							checked={eventPassSelected}
							disabled={eventPassDisabled}
							onChange={(event) => onToggleEventPass(event.target.checked)}
							className="h-4 w-4 rounded border-[#2a2a2a] bg-transparent"
						/>
						Event Pass
					</span>
					<span className="text-[#a1a1aa]">
						{formatCurrency(eventPassPrice)}
					</span>
				</label>
				{eventPassDisabled ? (
					hasExistingWorkshopRegistrations ? (
						<p className="text-xs text-[#71717a]">
							Event pass already granted via workshop registration.
						</p>
					) : (
						<p className="text-xs text-[#71717a]">
							Disabled because one or more workshops are selected.
						</p>
					)
				) : null}
			</div>
		</div>
	);
}

export function Step2PaymentVerification({
	calculatedAmount,
	paymentVerified,
	onVerifyPayment,
}: {
	calculatedAmount: number;
	paymentVerified: boolean;
	onVerifyPayment: (value: boolean) => void;
}) {
	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-[#fafafa]">
				2. Payment Verification
			</h4>

			<div className="rounded-md border border-[#222222] bg-[#111111] p-3">
				<p className="text-xs text-[#71717a]">Total Amount</p>
				<p className="mt-1 text-lg font-semibold text-[#fafafa]">
					{formatCurrency(calculatedAmount)}
				</p>
			</div>

			<label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#fafafa]">
				<input
					type="checkbox"
					checked={paymentVerified}
					onChange={(event) => onVerifyPayment(event.target.checked)}
					className="h-4 w-4 rounded border-[#2a2a2a] bg-transparent"
				/>
				Payment Received
			</label>
		</div>
	);
}

export function Step3RegistrationSummary({
	selectedWorkshops,
	eventPassSelected,
	calculatedAmount,
	getWorkshopTitle,
	onConfirm,
	isSubmitting,
}: {
	selectedWorkshops: number[];
	eventPassSelected: boolean;
	calculatedAmount: number;
	getWorkshopTitle: (workshopId: number) => string;
	onConfirm: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-[#fafafa]">
				3. Registration Summary
			</h4>

			<div className="space-y-3 rounded-md border border-[#222222] bg-[#111111] p-3 text-sm">
				<div>
					<p className="text-xs text-[#71717a]">Selected Workshops</p>
					{selectedWorkshops.length > 0 ? (
						<div className="mt-1 space-y-1 text-[#fafafa]">
							{selectedWorkshops.map((workshopId) => (
								<p key={workshopId}>{getWorkshopTitle(workshopId)}</p>
							))}
						</div>
					) : (
						<p className="mt-1 text-[#a1a1aa]">None</p>
					)}
				</div>

				<div>
					<p className="text-xs text-[#71717a]">Event Pass</p>
					<p className="mt-1 text-[#fafafa]">
						{eventPassSelected ? "Yes" : "No"}
					</p>
				</div>

				<div>
					<p className="text-xs text-[#71717a]">Total Amount</p>
					<p className="mt-1 font-semibold text-[#fafafa]">
						{formatCurrency(calculatedAmount)}
					</p>
				</div>
			</div>

			<button
				type="button"
				onClick={onConfirm}
				disabled={isSubmitting}
				className={`w-full rounded-[10px] px-4 py-2 text-sm font-semibold transition-opacity duration-200 ${
					isSubmitting
						? "cursor-not-allowed border border-[#2a2a2a] bg-[#141414] text-[#71717a]"
						: "border border-white bg-white text-black"
				}`}
			>
				{isSubmitting ? "Confirming..." : "Confirm Registration"}
			</button>
		</div>
	);
}
