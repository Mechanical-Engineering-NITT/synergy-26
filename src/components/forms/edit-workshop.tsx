/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
/** biome-ignore-all lint/correctness/noChildrenProp: using tanstack forms */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { updateWorkshop } from "@/server/workshop";

const EditWorkshopInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.string().min(1, "Time is required"), // HH:MM
	location: z.string().min(1, "Location is required"),
	price: z.string().min(1, "Price is required"),
});

interface EditWorkshopFormProps {
	workshop: {
		id: number;
		title: string;
		description: string;
		time: string;
		location: string;
		price: string;
	};
	onSuccess?: () => void;
}

export function EditWorkshopForm({
	workshop,
	onSuccess,
}: EditWorkshopFormProps) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: updateWorkshop,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workshops"] });
			onSuccess?.();
		},
	});

	const form = useForm({
		defaultValues: {
			title: workshop.title,
			description: workshop.description,
			time: workshop.time,
			location: workshop.location,
			price: workshop.price,
		} as z.infer<typeof EditWorkshopInputSchema>,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				data: {
					id: workshop.id,
					data: value,
				},
			});
		},
	});

	return (
		<form
			autoComplete="off"
			className="space-y-4 rounded-lg border border-border bg-card p-4"
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
							EditWorkshopInputSchema.shape.title,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="title" className="mb-1 block text-sm font-medium">
							Title
						</label>
						<input
							id="title"
							type="text"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="mt-1 text-sm text-red-500">
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
							EditWorkshopInputSchema.shape.description,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="description"
							className="mb-1 block text-sm font-medium"
						>
							Description
						</label>
						<textarea
							id="description"
							className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="mt-1 text-sm text-red-500">
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
							EditWorkshopInputSchema.shape.time,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="time" className="mb-1 block text-sm font-medium">
							Time
						</label>
						<textarea
							id="time"
							className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-vertical min-h-32"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="mt-1 text-sm text-red-500">
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
							EditWorkshopInputSchema.shape.location,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="location"
							className="mb-1 block text-sm font-medium"
						>
							Location
						</label>
						<input
							id="location"
							type="text"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="mt-1 text-sm text-red-500">
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
							EditWorkshopInputSchema.shape.price,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="price" className="mb-1 block text-sm font-medium">
							Price
						</label>
						<input
							id="price"
							type="text"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="mt-1 text-sm text-red-500">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<button
				type="submit"
				disabled={mutation.isPending}
				className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{mutation.isPending ? "Updating..." : "Update Workshop"}
			</button>
		</form>
	);
}
