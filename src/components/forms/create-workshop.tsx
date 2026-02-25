/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
/** biome-ignore-all lint/correctness/noChildrenProp: using Tanstack forms */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { createWorkshop } from "@/server/workshop";

export const WorkshopInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.iso.datetime("Time is required"),
	location: z.string().min(1, "Location is required"),
	price: z.string().min(1, "Price is required"),
});

const CreateWorkshopInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.string().min(1, "Time is required"),
	location: z.string().min(1, "Location is required"),
	price: z.string().min(1, "Price is required"),
});

export function CreateWorkshopForm() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createWorkshop,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workshops"] });
			form.reset();
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			time: "",
			location: "",
			price: "",
		} as z.infer<typeof CreateWorkshopInputSchema>,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				data: value,
			});
		},
	});

	return (
		<form
			autoComplete="off"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field
				name="title"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							CreateWorkshopInputSchema.shape.title,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="workshop-title"
							className="block text-sm font-medium mb-1.5"
						>
							Title
						</label>
						<input
							id="workshop-title"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
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
				name="description"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							CreateWorkshopInputSchema.shape.description,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="workshop-description"
							className="block text-sm font-medium mb-1.5"
						>
							Description
						</label>
						<textarea
							id="workshop-description"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-vertical min-h-32"
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
				name="time"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							CreateWorkshopInputSchema.shape.time,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="workshop-time"
							className="block text-sm font-medium mb-1.5"
						>
							Time
						</label>
						<input
							id="workshop-time"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
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
				name="location"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							CreateWorkshopInputSchema.shape.location,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="workshop-location"
							className="block text-sm font-medium mb-1.5"
						>
							Location
						</label>
						<input
							id="workshop-location"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
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
				name="price"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							CreateWorkshopInputSchema.shape.price,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="workshop-price"
							className="block text-sm font-medium mb-1.5"
						>
							Price
						</label>
						<input
							id="workshop-price"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
						/>
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
				disabled={mutation.isPending}
				className="mt-6 w-full px-4 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{mutation.isPending ? "Creating..." : "Create Workshop"}
			</button>
		</form>
	);
}
