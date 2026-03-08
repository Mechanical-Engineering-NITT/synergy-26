type WorkshopOption = {
	id: number;
	title: string;
	price: number;
	isDisabled: boolean;
};

type EventOption = {
	id: number;
	title: string;
	isDisabled: boolean;
};

const formatCurrency = (amount: number) =>
	`₹${amount.toLocaleString("en-IN", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})}`;

export function Step1Selection({
	workshops,
	events,
	selectedWorkshops,
	selectedEventIds,
	existingWorkshopRegistrations,
	existingEventRegistrations,
	hasExistingWorkshopRegistrations,
	eventPassPrice,
	eventPassSelected,
	eventPassAlreadyOwned,
	onToggleWorkshop,
	onToggleEvent,
	onToggleEventPass,
}: {
	workshops: WorkshopOption[];
	events: EventOption[];
	selectedWorkshops: number[];
	selectedEventIds: number[];
	existingWorkshopRegistrations: number[];
	existingEventRegistrations: number[];
	hasExistingWorkshopRegistrations: boolean;
	eventPassPrice: number;
	eventPassSelected: boolean;
	eventPassAlreadyOwned: boolean;
	onToggleWorkshop: (workshopId: number) => void;
	onToggleEvent: (eventId: number) => void;
	onToggleEventPass: (value: boolean) => void;
}) {
	const eventPassDisabled =
		eventPassAlreadyOwned ||
		hasExistingWorkshopRegistrations ||
		selectedWorkshops.length > 0;
	const hasDisabledWorkshops = workshops.some(
		(workshop) => workshop.isDisabled,
	);
	const showEventSection =
		eventPassSelected || eventPassAlreadyOwned || selectedWorkshops.length > 0;

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
					const disabled = alreadyRegistered || workshop.isDisabled;

					return (
						<label
							key={workshop.id}
							className={`flex items-center justify-between rounded-md border border-[#222222] bg-[#0d0d0d] px-3 py-2 text-sm ${
								disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
							}`}
						>
							<span className="inline-flex items-center gap-2 text-[#fafafa]">
								<input
									type="checkbox"
									checked={selectedWorkshops.includes(workshop.id)}
									disabled={disabled}
									onChange={() => onToggleWorkshop(workshop.id)}
									className="h-4 w-4 rounded border-[#2a2a2a] bg-transparent"
								/>
								{workshop.title}
								{workshop.isDisabled ? (
									<span className="text-xs text-[#a1a1aa]">
										(Registration Disabled)
									</span>
								) : null}
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
				{hasDisabledWorkshops ? (
					<p className="text-xs text-[#71717a]">
						Some workshops are disabled and cannot be registered.
					</p>
				) : null}
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
					eventPassAlreadyOwned ? (
						<p className="text-xs text-[#71717a]">
							Event pass already present.
						</p>
					) : hasExistingWorkshopRegistrations ? (
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

			{showEventSection ? (
				<div className="space-y-2 rounded-md border border-[#222222] bg-[#111111] p-3">
					<p className="text-xs text-[#71717a]">Events</p>
					{events.map((eventEntry) => {
						const alreadyRegistered = existingEventRegistrations.includes(
							eventEntry.id,
						);
						const disabled = alreadyRegistered || eventEntry.isDisabled;

						return (
							<label
								key={eventEntry.id}
								className={`flex items-center justify-between rounded-md border border-[#222222] bg-[#0d0d0d] px-3 py-2 text-sm ${
									disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
								}`}
							>
								<span className="inline-flex items-center gap-2 text-[#fafafa]">
									<input
										type="checkbox"
										checked={selectedEventIds.includes(eventEntry.id)}
										disabled={disabled}
										onChange={() => onToggleEvent(eventEntry.id)}
										className="h-4 w-4 rounded border-[#2a2a2a] bg-transparent"
									/>
									{eventEntry.title}
									{eventEntry.isDisabled ? (
										<span className="text-xs text-[#a1a1aa]">
											(Registration Disabled)
										</span>
									) : null}
									{alreadyRegistered ? (
										<span className="text-xs text-[#a1a1aa]">
											(Already Registered)
										</span>
									) : null}
								</span>
							</label>
						);
					})}
				</div>
			) : null}
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
	selectedEvents,
	eventPassSelected,
	getWorkshopTitle,
	getEventTitle,
}: {
	selectedWorkshops: number[];
	selectedEvents: number[];
	eventPassSelected: boolean;
	getWorkshopTitle: (workshopId: number) => string;
	getEventTitle: (eventId: number) => string;
}) {
	const eventPassStatus =
		selectedWorkshops.length > 0
			? "Included (with workshop)"
			: eventPassSelected
				? "Purchased"
				: "Not Included";

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-[#fafafa]">
				3. Event + Workshop Summary
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
					<p className="mt-1 text-[#fafafa]">{eventPassStatus}</p>
				</div>

				<div>
					<p className="text-xs text-[#71717a]">Selected Events</p>
					{selectedEvents.length > 0 ? (
						<div className="mt-1 space-y-1 text-[#fafafa]">
							{selectedEvents.map((eventId) => (
								<p key={eventId}>{getEventTitle(eventId)}</p>
							))}
						</div>
					) : (
						<p className="mt-1 text-[#a1a1aa]">None</p>
					)}
				</div>
			</div>
		</div>
	);
}

export function Step4FinalConfirmation({
	calculatedAmount,
	onBack,
	onConfirm,
	isSubmitting,
}: {
	calculatedAmount: number;
	onBack: () => void;
	onConfirm: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="space-y-4">
			<h4 className="text-sm font-semibold text-[#fafafa]">
				4. Final Confirmation
			</h4>

			<div className="rounded-md border border-[#222222] bg-[#111111] p-3 text-sm">
				<p className="text-xs text-[#71717a]">Total Amount</p>
				<p className="mt-1 font-semibold text-[#fafafa]">
					{formatCurrency(calculatedAmount)}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onBack}
					disabled={isSubmitting}
					className={`rounded-[10px] border border-[#2a2a2a] px-4 py-2 text-sm transition-all duration-200 ${
						isSubmitting
							? "cursor-not-allowed bg-[#141414] text-[#71717a]"
							: "bg-transparent text-[#fafafa]"
					}`}
				>
					Back
				</button>

				<button
					type="button"
					onClick={onConfirm}
					disabled={isSubmitting}
					className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-opacity duration-200 ${
						isSubmitting
							? "cursor-not-allowed border border-[#2a2a2a] bg-[#141414] text-[#71717a]"
							: "border border-white bg-white text-black"
					}`}
				>
					{isSubmitting ? "Confirming..." : "Confirm Registration"}
				</button>
			</div>
		</div>
	);
}
