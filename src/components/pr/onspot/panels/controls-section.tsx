import { useMutation } from "@tanstack/react-query";
import { useMemo, useReducer } from "react";
import { completeOnspotRegistration } from "@/server/admin/pr/onspot/mutation";
import { calculateOnspotAmount } from "@/server/admin/pr/onspot/query";
import {
	createInitialOnspotRegistrationState,
	onspotRegistrationReducer,
} from "../onspot-registration-reducer";
import {
	Step1Selection,
	Step2PaymentVerification,
	Step3RegistrationSummary,
} from "../onspot-registration-steps";

type WorkshopOption = {
	id: number;
	title: string;
	price: number;
};

export function OnspotControlsSection({
	userId,
	workshops,
	eventPassPrice,
	existingWorkshopRegistrations,
	onActionComplete,
}: {
	userId: string;
	workshops: WorkshopOption[];
	eventPassPrice: number;
	existingWorkshopRegistrations: number[];
	onActionComplete: () => Promise<void>;
}) {
	const [state, dispatch] = useReducer(
		onspotRegistrationReducer,
		createInitialOnspotRegistrationState({
			existingWorkshopRegistrations,
			initialSelectedWorkshops: [],
			initialEventPassSelected: false,
		}),
	);

	const workshopTitleMap = useMemo(
		() =>
			new Map(
				workshops.map((workshopEntry) => [
					workshopEntry.id,
					workshopEntry.title,
				]),
			),
		[workshops],
	);

	const calculateAmountMutation = useMutation({
		mutationFn: async () =>
			calculateOnspotAmount({
				data: {
					selectedWorkshops: state.selectedWorkshops,
					eventPassSelected: state.eventPassSelected,
				},
			}),
		onSuccess: (result) => {
			dispatch({
				type: "SET_AMOUNT",
				calculatedAmount: result.totalAmount,
			});
		},
	});

	const completeRegistrationMutation = useMutation({
		mutationFn: async () =>
			completeOnspotRegistration({
				data: {
					userId,
					selectedWorkshops: state.selectedWorkshops,
					eventPassSelected: state.eventPassSelected,
					paymentVerified: state.paymentVerified,
				},
			}),
		onSuccess: async () => {
			await onActionComplete();
		},
	});

	const hasSelection =
		state.selectedWorkshops.length > 0 || state.eventPassSelected === true;
	const canProceedFromCurrentStep =
		state.currentStep === 1
			? hasSelection && state.hasChanges
			: state.currentStep === 2
				? state.paymentVerified
				: true;

	const isBackDisabled =
		state.currentStep === 1 ||
		calculateAmountMutation.isPending ||
		completeRegistrationMutation.isPending;
	const isNextDisabled =
		!canProceedFromCurrentStep ||
		calculateAmountMutation.isPending ||
		completeRegistrationMutation.isPending;

	const getWorkshopTitle = (workshopId: number) =>
		workshopTitleMap.get(workshopId) ?? `Workshop ${workshopId}`;

	const handleNext = async () => {
		if (state.currentStep === 1) {
			try {
				await calculateAmountMutation.mutateAsync();
				dispatch({ type: "NEXT_STEP" });
			} catch {}
			return;
		}

		dispatch({ type: "NEXT_STEP" });
	};

	const renderCurrentStep = () => {
		switch (state.currentStep) {
			case 1:
				return (
					<Step1Selection
						workshops={workshops}
						selectedWorkshops={state.selectedWorkshops}
						existingWorkshopRegistrations={existingWorkshopRegistrations}
						hasExistingWorkshopRegistrations={
							state.hasExistingWorkshopRegistrations
						}
						eventPassPrice={eventPassPrice}
						eventPassSelected={state.eventPassSelected}
						onToggleWorkshop={(workshopId) =>
							dispatch({
								type: "SELECT_WORKSHOP",
								workshopId,
								disabledWorkshopIds: existingWorkshopRegistrations,
							})
						}
						onToggleEventPass={(value) =>
							dispatch({ type: "TOGGLE_EVENT_PASS", value })
						}
					/>
				);

			case 2:
				return (
					<Step2PaymentVerification
						calculatedAmount={state.calculatedAmount}
						paymentVerified={state.paymentVerified}
						onVerifyPayment={(value) =>
							dispatch({ type: "VERIFY_PAYMENT", value })
						}
					/>
				);

			case 3:
				return (
					<Step3RegistrationSummary
						selectedWorkshops={state.selectedWorkshops}
						eventPassSelected={state.eventPassSelected}
						calculatedAmount={state.calculatedAmount}
						getWorkshopTitle={getWorkshopTitle}
						onConfirm={() => {
							completeRegistrationMutation.mutate();
						}}
						isSubmitting={completeRegistrationMutation.isPending}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="space-y-4 rounded-md border border-[#222222] bg-[#141414] p-4 text-[#fafafa]">
			<p className="text-xs text-[#71717a]">Step {state.currentStep} of 3</p>

			<div className="max-h-[45vh] overflow-y-auto pr-1">
				{renderCurrentStep()}
			</div>

			{calculateAmountMutation.isError ? (
				<p className="border-l-[3px] border-l-[#ef4444] pl-2 text-xs text-[#ef4444]">
					{calculateAmountMutation.error instanceof Error
						? calculateAmountMutation.error.message
						: "Failed to calculate onspot amount."}
				</p>
			) : null}

			{completeRegistrationMutation.isError ? (
				<p className="border-l-[3px] border-l-[#ef4444] pl-2 text-xs text-[#ef4444]">
					{completeRegistrationMutation.error instanceof Error
						? completeRegistrationMutation.error.message
						: "Failed to complete onspot registration."}
				</p>
			) : null}

			{state.currentStep < 3 ? (
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => dispatch({ type: "PREVIOUS_STEP" })}
						disabled={isBackDisabled}
						className={`rounded-[10px] border border-[#2a2a2a] px-4 py-2 text-sm transition-all duration-200 ${
							isBackDisabled
								? "cursor-not-allowed bg-[#141414] text-[#71717a]"
								: "bg-transparent text-[#fafafa]"
						}`}
					>
						Back
					</button>

					<button
						type="button"
						onClick={() => {
							void handleNext();
						}}
						disabled={isNextDisabled}
						className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-opacity duration-200 ${
							isNextDisabled
								? "cursor-not-allowed border border-[#2a2a2a] bg-[#141414] text-[#71717a]"
								: "border border-white bg-white text-black"
						}`}
					>
						{state.currentStep === 1 && calculateAmountMutation.isPending
							? "Calculating..."
							: "Next"}
					</button>
				</div>
			) : null}
		</div>
	);
}
