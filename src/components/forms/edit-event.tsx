/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
/** biome-ignore-all lint/correctness/noChildrenProp: using tanstack forms */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { updateEvent } from "@/server/event";

const EditEventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	longDescription: z.string().min(1, "Long description is required"),
	time: z.string().min(1, "Time is required"), // HH:MM
	location: z.string().min(1, "Location is required"),
	isDisabled: z.boolean().default(false),
});

interface EditEventFormProps {
	event: {
		id: number;
		title: string;
		description: string;
		longDescription: string;
		time: string;
		location: string;
		isDisabled: boolean;
	};
	onSuccess?: () => void;
}

export function EditEventForm({ event, onSuccess }: EditEventFormProps) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			onSuccess?.();
		},
	});

	const form = useForm({
		defaultValues: {
			title: event.title,
			description: event.description,
			longDescription: event.longDescription,
			time: event.time,
			location: event.location,
			isDisabled: event.isDisabled,
		} as z.infer<typeof EditEventInputSchema>,
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				data: {
					id: event.id,
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
							EditEventInputSchema.shape.title,
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
							EditEventInputSchema.shape.description,
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
							EditEventInputSchema.shape.time,
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
				name="longDescription"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							EditEventInputSchema.shape.longDescription,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="long-description"
							className="mb-1 block text-sm font-medium"
						>
							Long Description
						</label>
						<textarea
							id="long-description"
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
							EditEventInputSchema.shape.location,
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
				name="isDisabled"
				children={(field) => (
					<div className="flex items-center gap-2">
						<input
							id="is-disabled-edit"
							type="checkbox"
							className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring"
							checked={field.state.value ?? false}
							onChange={(e) => field.handleChange(e.target.checked)}
						/>
						<label
							htmlFor="is-disabled-edit"
							className="text-sm font-medium cursor-pointer"
						>
							Disable Registration
						</label>
					</div>
				)}
			/>
			<button
				type="submit"
				disabled={mutation.isPending}
				className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{mutation.isPending ? "Updating..." : "Update Event"}
			</button>
		</form>
	);
}
