/** biome-ignore-all lint/correctness/noChildrenProp: Using tanstack-forms */
/** biome-ignore-all lint/suspicious/noExplicitAny: tanstack-form state types */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Building2,
	Edit2,
	GraduationCap,
	IdCard,
	Mail,
	MapPin,
	Phone,
	Save,
	UserCircle,
	X,
} from "lucide-react";
import { useId, useState } from "react";
import Navbar from "@/components/common/navbar";
import { PaymentHistory } from "@/components/payment/payment-history";
import { requireOnBoardedUser } from "@/lib/utils";
import { UserInputSchema } from "@/routes/register";
import { getUserDetails, updateUserDetails } from "@/server/user";

export const Route = createFileRoute("/profile/")({
	component: RouteComponent,
	loader: async () => {
		await requireOnBoardedUser();
	},
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const genderId = useId();
	const { data: user, isLoading } = useQuery({
		queryKey: ["userDetails"],
		queryFn: () => getUserDetails(),
	});

	const mutation = useMutation({
		mutationFn: updateUserDetails,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userDetails"] });
			setIsEditing(false);
		},
	});

	const form = useForm({
		defaultValues: {
			fullname: user?.fullname ?? "",
			college: user?.college ?? "",
			city: user?.city ?? "",
			department: user?.department ?? "",
			year: user?.year ?? "",
			phone: user?.phone ?? "",
			gender: (user?.gender as "male" | "female" | "other") ?? "male",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({ data: value });
		},
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
				<Navbar user={null} />
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="flex flex-col items-center gap-6 relative z-10">
					<div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
					<p className="text-cyan-400 font-black uppercase tracking-[0.4em] animate-pulse">
						Synchronizing Profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
				<Navbar user={null} />
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
				<div className="bg-zinc-900/50 backdrop-blur-md border border-red-500/50 p-12 -skew-x-2 text-center relative z-10 shadow-[20px_20px_0px_0px_rgba(239,68,68,0.2)]">
					<h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic mb-4">
						Access Denied
					</h2>
					<p className="text-gray-400 font-bold uppercase tracking-widest max-w-sm">
						Critical error: Failed to retrieve profile signal. Please refresh or
						contact system admin.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black font-sans text-white selection:bg-fuchsia-500/30 relative overflow-hidden">
			<Navbar
				user={{
					id: user.userId,
					email: user.email,
					name: user.fullname,
				}}
			/>
			{/* Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			<div className="relative z-10 max-w-5xl mx-auto px-4 py-20">
				<div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 overflow-hidden -skew-x-1 shadow-[15px_15px_0px_0px_rgba(34,211,238,0.2)]">
					{/* Profile Header */}
					<div className="pt-12 pb-10 px-8 md:px-12 border-b border-white/5 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-cyan-500/10 to-transparent"></div>
						<div>
							<h1
								className="text-4xl md:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-4 uppercase"
								style={{
									WebkitTextStroke: "1px rgba(255,255,255,0.05)",
									textShadow: "2px 2px 0px #fef3c7",
								}}
							>
								{user.fullname}
							</h1>
							<div className="flex flex-wrap items-center gap-4 text-cyan-400 font-bold uppercase tracking-widest text-xs">
								<span className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 border border-cyan-500/30">
									<GraduationCap className="w-3 h-3" />
									{user.year}
								</span>
								<span className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 border border-cyan-500/30">
									<Building2 className="w-3 h-3" />
									{user.department}
								</span>
							</div>
							<div className="mt-6 flex items-center">
								<div className="bg-amber-400/10 border border-amber-400/50 p-3 flex items-center gap-4 shadow-[0_0_15px_rgba(251,191,36,0.15)] backdrop-blur-sm -skew-x-6">
									<div className="bg-amber-400 text-black p-2 skew-x-6">
										<IdCard className="w-5 h-5" />
									</div>
									<div className="skew-x-6 pr-4">
										<p className="text-[10px] font-black text-amber-400/80 uppercase tracking-[0.2em] mb-0.5">
											Synergy ID
										</p>
										<p className="text-2xl font-black text-amber-400 tracking-widest leading-none drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
											{user.synergyId || "UNASSIGNED"}
										</p>
									</div>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => {
								if (isEditing) {
									form.reset();
								}
								setIsEditing(!isEditing);
							}}
							className="relative z-20 flex items-center gap-2 bg-amber-400 text-black px-6 py-2 font-black uppercase tracking-tighter -skew-x-12 hover:bg-amber-300 transition-colors shadow-[4px_4px_0px_0px_rgba(34,211,238,1)]"
						>
							<span className="skew-x-12 flex items-center gap-2">
								{isEditing ? (
									<>
										<X className="w-4 h-4" /> Cancel
									</>
								) : (
									<>
										<Edit2 className="w-4 h-4" /> Edit Profile
									</>
								)}
							</span>
						</button>
					</div>

					<div className="px-8 md:px-12 py-12">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
								{/* Personal Section */}
								<div className="space-y-8">
									<h2 className="text-xl font-black text-amber-400 uppercase tracking-widest italic flex items-center gap-3">
										<span className="w-2 h-2 bg-cyan-500"></span>
										Personal Intel
									</h2>
									<div className="grid gap-6">
										{isEditing ? (
											<>
												<form.Field
													name="fullname"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.fullname,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<UserCircle className="w-5 h-5" />}
															label="Full Name"
															field={field}
														/>
													)}
												/>
												<form.Field
													name="gender"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.gender,
															),
													}}
													children={(field) => (
														<div className="flex items-start gap-4 p-5 bg-white/5 border border-cyan-500/50 transition-all group relative overflow-hidden">
															<div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-cyan-500/5 to-transparent"></div>
															<div className="p-2.5 bg-black border border-cyan-500 text-cyan-400 transition-all">
																<UserCircle className="w-5 h-5" />
															</div>
															<div className="flex-1">
																<label
																	htmlFor={genderId}
																	className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block"
																>
																	Gender
																</label>
																<select
																	id={genderId}
																	value={field.state.value}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(
																			e.target.value as
																				| "male"
																				| "female"
																				| "other",
																		)
																	}
																	className="w-full bg-black/50 border border-white/10 px-3 py-1 text-white font-bold uppercase tracking-tight focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
																>
																	<option value="male" className="bg-zinc-900">
																		Male
																	</option>
																	<option
																		value="female"
																		className="bg-zinc-900"
																	>
																		Female
																	</option>
																	<option value="other" className="bg-zinc-900">
																		Other
																	</option>
																</select>
																{field.state.meta.errors.length > 0 && (
																	<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
																		{
																			field.state.meta.errors.map(
																				(e) => e?.message,
																			)[0]
																		}
																	</p>
																)}
															</div>
														</div>
													)}
												/>
											</>
										) : (
											<InfoItem
												icon={<UserCircle className="w-5 h-5" />}
												label="Gender"
												value={user.gender}
											/>
										)}

										<InfoItem
											icon={<Mail className="w-5 h-5" />}
											label="Email"
											value={user.email}
										/>

										{isEditing ? (
											<>
												<form.Field
													name="phone"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.phone,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<Phone className="w-5 h-5" />}
															label="Terminal"
															field={field}
														/>
													)}
												/>
												<form.Field
													name="city"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.city,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<MapPin className="w-5 h-5" />}
															label="Sector"
															field={field}
														/>
													)}
												/>
											</>
										) : (
											<>
												<InfoItem
													icon={<Phone className="w-5 h-5" />}
													label="Terminal"
													value={user.phone}
												/>
												<InfoItem
													icon={<MapPin className="w-5 h-5" />}
													label="Sector"
													value={user.city}
												/>
											</>
										)}
									</div>
								</div>

								{/* Academic Section */}
								<div className="space-y-8">
									<h2 className="text-xl font-black text-amber-400 uppercase tracking-widest italic flex items-center gap-3">
										<span className="w-2 h-2 bg-cyan-500"></span>
										Academic Records
									</h2>
									<div className="grid gap-6">
										{isEditing ? (
											<>
												<form.Field
													name="college"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.college,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<Building2 className="w-5 h-5" />}
															label="Institute"
															field={field}
														/>
													)}
												/>
												<form.Field
													name="department"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.department,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<Building2 className="w-5 h-5" />}
															label="Division"
															field={field}
														/>
													)}
												/>
												<form.Field
													name="year"
													validators={{
														onBlur: ({ fieldApi }) =>
															fieldApi.parseValueWithSchema(
																UserInputSchema.shape.year,
															),
													}}
													children={(field) => (
														<EditItem
															icon={<GraduationCap className="w-5 h-5" />}
															label="Cycle"
															field={field}
														/>
													)}
												/>
											</>
										) : (
											<>
												<InfoItem
													icon={<Building2 className="w-5 h-5" />}
													label="Institute"
													value={user.college}
												/>
												<InfoItem
													icon={<Building2 className="w-5 h-5" />}
													label="Division"
													value={user.department}
												/>
												<InfoItem
													icon={<GraduationCap className="w-5 h-5" />}
													label="Cycle"
													value={`${user.year}`}
												/>
											</>
										)}
									</div>
								</div>
							</div>

							{isEditing && (
								<div className="mt-12 flex justify-center">
									<button
										type="submit"
										disabled={mutation.isPending}
										className="group relative px-12 py-4 bg-cyan-500 text-black font-black text-xl -skew-x-12 transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden shadow-[5px_5px_0px_0px_rgba(251,191,36,1)] disabled:opacity-50"
									>
										<span className="relative z-10 flex items-center gap-3 skew-x-12 uppercase">
											{mutation.isPending ? (
												"Updating..."
											) : (
												<>
													<Save className="w-6 h-6" /> Save Changes
												</>
											)}
										</span>
										<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
									</button>
								</div>
							)}
						</form>

						{/* Payment History Section */}
						<div className="mt-20 space-y-8">
							<h2 className="text-xl font-black text-cyan-400 uppercase tracking-widest italic flex items-center gap-3">
								<span className="w-2 h-2 bg-amber-400"></span>
								Transaction Logs
							</h2>
							<div className="bg-white/5 border border-white/10 p-4 md:p-8 -skew-x-1">
								<PaymentHistory />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function EditItem({
	icon,
	label,
	field,
}: {
	icon: React.ReactNode;
	label: string;
	field: any;
}) {
	const id = useId();
	return (
		<div className="flex items-start gap-4 p-5 bg-white/5 border border-cyan-500/50 transition-all group relative overflow-hidden">
			<div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-cyan-500/5 to-transparent"></div>
			<div className="p-2.5 bg-black border border-cyan-500 text-cyan-400 transition-all">
				{icon}
			</div>
			<div className="flex-1">
				<label
					htmlFor={id}
					className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block"
				>
					{label}
				</label>
				<input
					id={id}
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					className="w-full bg-black/50 border border-white/10 px-3 py-1 text-white font-bold uppercase tracking-tight focus:outline-none focus:border-cyan-500 transition-colors"
				/>
				{field.state.meta.errors.length > 0 && (
					<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
						{field.state.meta.errors.map((e: any) => e?.message)[0]}
					</p>
				)}
			</div>
		</div>
	);
}

function InfoItem({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | number;
}) {
	return (
		<div className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
			<div className="absolute top-0 right-0 w-8 h-8 bg-linear-to-bl from-cyan-500/5 to-transparent"></div>
			<div className="p-2.5 bg-black border border-white/10 text-cyan-400 group-hover:text-amber-400 group-hover:border-amber-400/50 transition-all">
				{icon}
			</div>
			<div>
				<p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
					{label}
				</p>
				<p className="text-white font-bold tracking-tight uppercase">{value}</p>
			</div>
		</div>
	);
}
