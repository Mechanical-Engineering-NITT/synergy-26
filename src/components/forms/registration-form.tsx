/** biome-ignore-all lint/correctness/useUniqueElementIds: form field IDs are unique within this form */
/** biome-ignore-all lint/correctness/noChildrenProp: Using tanstack-forms */
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { registerUser } from "@/server/registration";

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

interface RegistrationFormProps {
	userId: string;
	defaultName?: string;
}

export function RegistrationForm({
	userId,
	defaultName,
}: RegistrationFormProps) {
	const nav = useNavigate();
	const mutation = useMutation({
		mutationFn: registerUser,
	});

	const form = useForm({
		defaultValues: {
			fullname: defaultName ?? "",
			college: "",
			city: "",
			department: "",
			year: "",
			phone: "",
			gender: "male",
		} as z.infer<typeof UserInputSchema>,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				data: { userId, values: value },
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
			className="flex flex-col gap-6 max-w-xl mx-auto max-h-[80vh] overflow-y-auto py-10 px-10 scrollbar-hide"
		>
			<h1 className="text-3xl font-bold mb-1 text-white text-center font-ui">
				COMPLETE YOUR REGISTRATION
			</h1>
			<p className="text-center text-white mb-6 font-ui">
				We need a few more details to complete your registration.
			</p>
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
						<label
							htmlFor="fullname"
							className="block font-semibold text-white font-ui"
						>
							Full Name
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="fullname"
								name="fullname"
								type="text"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-3 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="college"
							className="block font-semibold text-white font-ui"
						>
							College
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="college"
								name="college"
								type="text"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-2 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="city"
							className="block font-semibold text-white font-ui"
						>
							City
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="city"
								name="city"
								type="text"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-2 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="department"
							className="block font-semibold text-white font-ui"
						>
							Department
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="department"
								name="department"
								type="text"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-3 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="year"
							className="block font-semibold text-white font-ui"
						>
							Year
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="year"
								name="year"
								type="text"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-3 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="phone"
							className="block font-semibold text-white font-ui"
						>
							Phone
						</label>
						<div className="input-wrapper mb-2">
							<input
								id="phone"
								name="phone"
								type="tel"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								className="w-full input-with-pink-bar px-2 py-3 text-white font-ui focus:outline-none"
							/>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-0.5 font-ui">
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
						<label
							htmlFor="gender"
							className="block font-semibold text-white font-ui"
						>
							Gender
						</label>
						<div className="input-wrapper mb-2">
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
								className="w-full input-with-pink-bar px-2 py-3 text-white font-ui focus:outline-none bg-transparent"
							>
								<option className="text-black" value="">
									Select Gender
								</option>
								<option className="text-black" value="male">
									Male
								</option>
								<option className="text-black" value="female">
									Female
								</option>
								<option className="text-black" value="other">
									Other
								</option>
							</select>
						</div>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm mt-1 font-ui">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<button
				type="submit"
				className={`${mutation.isSuccess ? "bg-green-500" : "bg-blue-500"} text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 font-ui`}
				disabled={mutation.isPending || mutation.isSuccess}
			>
				{mutation.isSuccess
					? "Success!"
					: mutation.isPending
						? "Submitting..."
						: "Complete Registration"}
			</button>
			{mutation.isError ? (
				<p className="text-red-500 text-sm mt-0.5 font-ui">
					{(mutation.error as Error).message}
				</p>
			) : null}
		</form>
	);
}
