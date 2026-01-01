/** biome-ignore-all lint/correctness/useUniqueElementIds: form field IDs are unique within this form */
/** biome-ignore-all lint/correctness/noChildrenProp: Using tanstack-forms */
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import z from "zod";
import { getAppUserByUserID } from "@/server/db-user-select";
import { registerUser } from "@/server/registration";
import { getSession } from "@/server/session";

// refactor: move schema to a shared file, use reusable components for form fields

const userSchema = z.object({
	fullname: z
		.string("Full Name is required")
		.min(3, "Full Name is required")
		.regex(/^[a-zA-Z\s]+$/, "Full Name can contain only letters and spaces"),
	college: z.string("College is required").min(3, "College is required"),
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
		const session = await getSession();
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
		const appUser = await getAppUserByUserID({ data: { id: session.user.id } });
		return appUser;
	},
});

function Register() {
	const nav = useNavigate();
	const appUser = Route.useLoaderData();

	const form = useForm({
		defaultValues: {
			fullname: appUser?.fullname ?? "",
			college: "",
			city: "",
			department: "",
			year: "",
			phone: "",
			gender: "male",
		} as z.infer<typeof userSchema>,
		validators: {
			onChange: userSchema,
		},
		onSubmit: async ({ value }) => {
			// send post req to the server fn
			const result = await registerUser({ data: value });

			// redirect on success
			if (result.success) nav({ to: "/" });
		},
	});
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-4 max-w-md mx-auto mt-10"
		>
			<h1 className="text-2xl font-bold mb-4">Complete your registration</h1>
			<form.Field
				name="fullname"
				children={(field) => (
					<>
						<label htmlFor="fullname" className="block mb-1 font-medium">
							Full Name
						</label>
						<input
							id="fullname"
							name="fullname"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="college"
				children={(field) => (
					<>
						<label htmlFor="college" className="block mb-1 font-medium">
							College
						</label>
						<input
							id="college"
							name="college"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="city"
				children={(field) => (
					<>
						<label htmlFor="city" className="block mb-1 font-medium">
							City
						</label>
						<input
							id="city"
							name="city"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="department"
				children={(field) => (
					<>
						<label htmlFor="department" className="block mb-1 font-medium">
							Department
						</label>
						<input
							id="department"
							name="department"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="year"
				children={(field) => (
					<>
						<label htmlFor="year" className="block mb-1 font-medium">
							Year
						</label>
						<input
							id="year"
							name="year"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="phone"
				children={(field) => (
					<>
						<label htmlFor="phone" className="block mb-1 font-medium">
							Phone
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="gender"
				children={(field) => (
					<>
						<label htmlFor="gender" className="block mb-1 font-medium">
							Gender
						</label>
						<select
							id="gender"
							name="gender"
							value={field.state.value}
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
								{field.state.meta.errors
									.map((error) => error?.message)
									.join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<button
				type="submit"
				className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
			>
				Submit
			</button>
		</form>
	);
}
