/** biome-ignore-all lint/correctness/useUniqueElementIds: form field IDs are unique within this form */
/** biome-ignore-all lint/correctness/noChildrenProp: Using tanstack-forms */
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { userRequiredMiddleware } from "@/lib/middleware";
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
	server: {
		middleware: [userRequiredMiddleware],
	},
	loader: async () => {
		const session = await getCurrentSession();
		if (!session) {
			throw redirect({
				to: "/",
			});
		}
		if (session.user.onBoardingComplete) {
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
		<form
			autoComplete="off"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4 max-w-md mx-auto mt-10"
		>
			<h1 className="text-2xl font-bold mb-4">Complete your registration</h1>
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
					<>
						<label htmlFor="fullname" className="block mb-1 font-medium">
							Full Name
						</label>
						<input
							id="fullname"
							name="fullname"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message)[0]}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="college" className="block mb-1 font-medium">
							College
						</label>
						<input
							id="college"
							name="college"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="city" className="block mb-1 font-medium">
							City
						</label>
						<input
							id="city"
							name="city"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="department" className="block mb-1 font-medium">
							Department
						</label>
						<input
							id="department"
							name="department"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="year" className="block mb-1 font-medium">
							Year
						</label>
						<input
							id="year"
							name="year"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="phone" className="block mb-1 font-medium">
							Phone
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
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
					<>
						<label htmlFor="gender" className="block mb-1 font-medium">
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
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						>
							<option value="">Select Gender</option>
							<option value="male">Male</option>
							<option value="female">Female</option>
							<option value="other">Other</option>
						</select>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<button
				type="submit"
				className={`${mutation.isSuccess ? "bg-green-500" : "bg-blue-500"} text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400`}
				disabled={mutation.isPending || mutation.isSuccess}
			>
				{mutation.isSuccess
					? "Success!"
					: mutation.isPending
						? "Submitting..."
						: "Submit"}
			</button>
			{mutation.isError ? (
				<p className="text-red-500 text-sm mt-1">
					{(mutation.error as Error).message}
				</p>
			) : null}
		</form>
	);
}
