import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	createOrder,
	getRazorpayKeyId,
	verifyPayment,
} from "@/server/razorpay";
import { getUserDetails } from "@/server/user";

declare global {
	interface Window {
		Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
	}
}

interface RazorpayOptions {
	key: string;
	amount: string;
	currency: string;
	name: string;
	description: string;
	image?: string;
	order_id: string;
	handler: (response: RazorpayResponse) => void;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	notes?: Record<string, string>;
	theme?: {
		color?: string;
	};
}

interface RazorpayInstance {
	open: () => void;
	close: () => void;
}

interface RazorpayResponse {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}

interface PaymentButtonProps {
	amount: number; // in paise
	workshopId?: number | null;
	isEventPass?: boolean;
	accommodation?: number;
	description: string;
	onSuccess?: (response: RazorpayResponse) => void;
	onError?: (error: Error) => void;
	className?: string;
	buttonText?: string;
	disabled?: boolean;
}

export default function PaymentButton({
	amount,
	workshopId = null,
	isEventPass = false,
	accommodation = 0,
	description,
	onSuccess,
	onError,
	className = "",
	buttonText,
	disabled = false,
}: PaymentButtonProps) {
	const [sdkReady, setSdkReady] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState<
		"idle" | "verifying" | "success" | "failed"
	>("idle");

	const { data: userDetails, isLoading: isLoadingUserDetails } = useQuery({
		queryKey: ["userDetails"],
		queryFn: () => getUserDetails(),
	});

	// Load Razorpay SDK
	useEffect(() => {
		if (window.Razorpay) {
			setSdkReady(true);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => setSdkReady(true);
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const createOrderMutation = useMutation({
		mutationFn: async () => {
			const orderId = await createOrder({
				data: {
					amount,
					workshopId,
					isEventPass,
					accommodation,
				},
			});
			const keyId = await getRazorpayKeyId();
			return { orderId, keyId };
		},
		onSuccess: ({ orderId, keyId }) => {
			if (!sdkReady) {
				console.error("Razorpay SDK not loaded");
				return;
			}

			const options: RazorpayOptions = {
				key: keyId,
				amount: amount.toString(),
				currency: "INR",
				name: "Synergy 26",
				description,
				order_id: orderId,
				handler: (response: RazorpayResponse) => {
					setPaymentStatus("verifying");
					verifyMutation.mutate({
						orderId: response.razorpay_order_id,
						paymentId: response.razorpay_payment_id,
						signature: response.razorpay_signature,
					});
				},
				prefill: {
					name: userDetails?.fullname || "Synergy User",
					email: userDetails?.email || "synergy@nitt.edu",
					contact: userDetails?.phone || "9999999999",
				},
				theme: {
					color: "#3399cc",
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		},
		onError: (error) => {
			console.error("Order creation failed:", error);
			onError?.(error as Error);
		},
	});

	const verifyMutation = useMutation({
		mutationFn: async (data: {
			orderId: string;
			paymentId: string;
			signature: string;
		}) => {
			return await verifyPayment({ data });
		},
		onSuccess: () => {
			setPaymentStatus("success");
			onSuccess?.({
				razorpay_order_id: verifyMutation.variables?.orderId || "",
				razorpay_payment_id: verifyMutation.variables?.paymentId || "",
				razorpay_signature: verifyMutation.variables?.signature || "",
			});
		},
		onError: (error) => {
			console.error("Payment verification failed:", error);
			setPaymentStatus("failed");
			onError?.(error as Error);
		},
	});

	const handlePayment = () => {
		setPaymentStatus("idle");
		createOrderMutation.mutate();
	};

	const getButtonText = () => {
		if (isLoadingUserDetails) return "Loading User Details...";
		if (paymentStatus === "success") return "Payment Verified!";
		if (paymentStatus === "failed") return "Verification Failed";
		if (paymentStatus === "verifying") return "Verifying Payment...";
		if (createOrderMutation.isPending) return "Creating Order...";
		return (
			buttonText ||
			`Pay ₹${(amount / 100).toLocaleString(undefined, {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2,
			})}`
		);
	};

	return (
		<button
			type="button"
			onClick={handlePayment}
			disabled={
				!sdkReady ||
				isLoadingUserDetails ||
				createOrderMutation.isPending ||
				paymentStatus === "verifying" ||
				paymentStatus === "success" ||
				disabled
			}
			className={`group relative w-full py-4 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 -skew-x-12 overflow-hidden flex items-center justify-center gap-2
                ${
									paymentStatus === "success"
										? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 cursor-not-allowed opacity-50"
										: paymentStatus === "failed"
											? "bg-red-600 text-white shadow-[4px_4px_0px_0px_rgba(254,243,199,1)] hover:translate-x-0.5 hover:translate-y-0.5"
											: createOrderMutation.isPending ||
													paymentStatus === "verifying" ||
													!sdkReady ||
													disabled
												? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
												: "bg-amber-400 text-black hover:bg-amber-300 shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] hover:translate-x-0.5 hover:translate-y-0.5"
								} ${className}`}
		>
			<span className="relative z-10 block skew-x-12">{getButtonText()}</span>
			<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
		</button>
	);
}
