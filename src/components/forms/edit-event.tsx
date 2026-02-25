/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
/** biome-ignore-all lint/correctness/noChildrenProp: using tanstack forms */
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { updateEvent } from "@/server/event";

const EditEventInputSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	date: z.string().min(1, "Date is required"), // YYYY-MM-DD
	time: z.string().min(1, "Time is required"), // HH:MM
	location: z.string().min(1, "Location is required"),
});

interface EditEventFormProps {
	event: {
		id: number;
		title: string;
		description: string;
		time: Date;
		location: string;
	};
}

export function EditEventForm({ event }: EditEventFormProps) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: updateEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["events"] });
			form.reset();
		},
	});

	const eventDate = new Date(event.time);
	const form = useForm({
		defaultValues: {
			title: event.title,
			description: event.description,
			date: eventDate.toISOString().split("T")[0], // YYYY-MM-DD
			time: eventDate.toTimeString().slice(0, 5), // HH:MM
			location: event.location,
		} as z.infer<typeof EditEventInputSchema>,
		onSubmit: async ({ value }) => {
			// Combine date and time into ISO datetime string
			const { date, time, ...rest } = value;
			const combinedDateTime = new Date(`${date}T${time}`).toISOString();
			await mutation.mutateAsync({
				data: {
					id: event.id,
					data: {
						...rest,
						time: combinedDateTime,
					},
				},
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
							EditEventInputSchema.shape.title,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="title">Title</label>
						<input
							id="title"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm">
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
						<label htmlFor="description">Description</label>
						<textarea
							id="description"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<form.Field
				name="date"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							EditEventInputSchema.shape.date,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="date">Date</label>
						<input
							id="date"
							type="date"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm">
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
						<label htmlFor="time">Time</label>
						<input
							id="time"
							type="time"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm">
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
						<label htmlFor="location">Location</label>
						<input
							id="location"
							type="text"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{!field.state.meta.isValid && (
							<p className="text-red-500 text-sm">
								{field.state.meta.errors.map((e) => e?.message).join(", ")}
							</p>
						)}
					</>
				)}
			/>
			<button
				type="submit"
				disabled={mutation.isPending}
				className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			>
				{mutation.isPending ? "Updating..." : "Update Event"}
			</button>
		</form>
	);
}
