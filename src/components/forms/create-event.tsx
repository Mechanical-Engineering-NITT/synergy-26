/** biome-ignore-all lint/correctness/noChildrenProp: using Tanstack forms */
/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { createEvent } from "@/server/event";

export const EventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.string().min(1, "Time is required"),
	location: z.string().min(1, "Location is required"),
});

const CreateEventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	time: z.string().min(1, "Time is required"),
	location: z.string().min(1, "Location is required"),
});

export function CreateEventForm() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			form.reset();
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
			time: new Date().toTimeString().slice(0, 5), // HH:MM
			location: "",
		} as z.infer<typeof CreateEventInputSchema>,
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
							CreateEventInputSchema.shape.title,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="title" className="block text-sm font-medium mb-1.5">
							Title
						</label>
						<input
							id="title"
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
							CreateEventInputSchema.shape.description,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="description"
							className="block text-sm font-medium mb-1.5"
						>
							Description
						</label>
						<textarea
							id="description"
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
							CreateEventInputSchema.shape.time,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="time" className="block text-sm font-medium mb-1.5">
							Time
						</label>
						<input
							id="time"
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
							CreateEventInputSchema.shape.location,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label
							htmlFor="location"
							className="block text-sm font-medium mb-1.5"
						>
							Location
						</label>
						<input
							id="location"
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
				{mutation.isPending ? "Creating..." : "Create Event"}
			</button>
		</form>
	);
}
