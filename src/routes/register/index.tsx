/** biome-ignore-all lint/correctness/useUniqueElementIds: form field IDs are unique within this form */
/** biome-ignore-all lint/correctness/noChildrenProp: Using tanstack-forms */
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { getCurrentSession } from "@/lib/utils";
import { registerUser } from "@/server/registration";

// refactor: use reusable form components

export const UserInputSchema = z.object({
	fullname: z
		.string("Full Name is required")
		.min(3, "Full Name must be greater than three characters")
		.regex(/^[a-zA-Z\s]+$/, "Full Name can contain only letters and spaces"),
	college: z.string("College is required").min(1, "College is required"),
	city: z.string("City is required").min(1, "City is required"),
	department: z
		.string("Department is required")
		.min(1, "Department is required"),
	year: z.string("Year is required").min(1, "Year is required"),
	phone: z
		.string("Phone Number is required")
		.regex(/^[0-9]{10}$/, "Phone number is required"),
	gender: z.enum(["male", "female", "other"], "Select a gender"),
});

export const Route = createFileRoute("/register/")({
	component: Register,
	loader: async () => {
		const session = await getCurrentSession();
		if (!session || session.user.onBoardingComplete) {
			throw redirect({
				to: "/",
			});
		}
		return session.user;
	},
});

function Register() {
	const nav = useNavigate();
	const appUser = Route.useLoaderData();
	const mutation = useMutation({
		mutationFn: registerUser,
	});

	const form = useForm({
		defaultValues: {
			fullname: appUser?.name ?? "",
			college: "",
			city: "",
			department: "",
			year: "",
			phone: "",
			gender: "male",
		} as z.infer<typeof UserInputSchema>,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				data: { userId: appUser.id, values: value },
			});
			nav({ to: "/" });
		},
	});
	return (
		<div className="min-h-screen bg-black font-sans text-white selection:bg-fuchsia-500/30 relative overflow-hidden flex items-center justify-center py-20 px-4">
			{/* Starry Background Layer */}
			<div className="absolute inset-0 bg-black z-0">
				<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen"></div>
			</div>

			<div className="relative z-10 w-full max-w-2xl">
				<div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-8 md:p-12 -skew-x-1 shadow-[20px_20px_0px_0px_rgba(254,243,199,0.1)]">
					<div className="mb-12 text-center md:text-left">
						<h1
							className="text-3xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-red-950 via-red-900 to-red-800 drop-shadow-[0_0_20px_rgba(254,243,199,0.3)] mb-4 uppercase"
							style={{
								WebkitTextStroke: "1px rgba(255,255,255,0.05)",
								textShadow: "2px 2px 0px #fef3c7",
							}}
						>
							Initialize Profile
						</h1>
						<p className="text-cyan-400 font-bold uppercase tracking-[0.3em] text-xs">
							Synergy 2026 {"//"} Registration Protocol
						</p>
					</div>

					<form
						autoComplete="off"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-8"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
							<form.Field
								name="fullname"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.fullname,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="fullname"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Full Name
										</label>
										<input
											id="fullname"
											name="fullname"
											type="text"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors.map((e) => e?.message)[0]}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="gender"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.gender,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="gender"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Gender
										</label>
										<select
											id="gender"
											name="gender"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value as "male" | "female" | "other",
												)
											}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase appearance-none"
										>
											<option value="" className="bg-zinc-900">
												Select
											</option>
											<option value="male" className="bg-zinc-900">
												Male
											</option>
											<option value="female" className="bg-zinc-900">
												Female
											</option>
											<option value="other" className="bg-zinc-900">
												Other
											</option>
										</select>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="phone"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.phone,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="phone"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Phone
										</label>
										<input
											id="phone"
											name="phone"
											type="tel"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="city"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.city,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="city"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											City
										</label>
										<input
											id="city"
											name="city"
											type="text"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="college"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.college,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2 md:col-span-2">
										<label
											htmlFor="college"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Institute
										</label>
										<input
											id="college"
											name="college"
											type="text"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="department"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.department,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="department"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Department
										</label>
										<input
											id="department"
											name="department"
											type="text"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
							<form.Field
								name="year"
								validators={{
									onBlur: ({ fieldApi }) => {
										const errors = fieldApi.parseValueWithSchema(
											UserInputSchema.shape.year,
										);
										return errors;
									},
								}}
								children={(field) => (
									<div className="space-y-2">
										<label
											htmlFor="year"
											className="block text-[10px] font-black text-cyan-400/70 uppercase tracking-[0.2em] ml-1"
										>
											Year (1st year, 2nd year, etc.)
										</label>
										<input
											id="year"
											name="year"
											type="text"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="w-full bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold tracking-tight uppercase"
										/>
										{!field.state.meta.isValid && (
											<p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
												{field.state.meta.errors
													.map((e) => e?.message)
													.join(", ")}
											</p>
										)}
									</div>
								)}
							/>
						</div>

						<div className="pt-4">
							<button
								type="submit"
								className={`group relative w-full px-10 py-4 font-black text-xl -skew-x-12 transition-all hover:translate-y-1 active:translate-y-2 overflow-hidden shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] ${
									mutation.isSuccess
										? "bg-emerald-500 text-white"
										: "bg-amber-400 text-black hover:bg-amber-300"
								} disabled:opacity-50 disabled:translate-y-0`}
								disabled={mutation.isPending || mutation.isSuccess}
							>
								<span className="relative z-10 block skew-x-12 uppercase">
									{mutation.isSuccess
										? "Access Granted"
										: mutation.isPending
											? "Syncing..."
											: "Establish Connection"}
								</span>
								<div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
							</button>
							{mutation.isError ? (
								<p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 text-center">
									Conflict detected: {(mutation.error as Error).message}
								</p>
							) : null}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
