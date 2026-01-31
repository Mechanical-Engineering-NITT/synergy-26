/** biome-ignore-all lint/correctness/useUniqueElementIds: all ids are unique */
/** biome-ignore-all lint/correctness/noChildrenProp: using tanstack forms */
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";
import { updateEvent } from "@/server/event";
import { EventInputSchema } from "./create-event";

interface EditEventFormProps {
	event: {
		id: number;
		title: string;
		description: string;
		time: Date;
		location: string;
	};
	onSuccess?: () => void;
}

export function EditEventForm({ event, onSuccess }: EditEventFormProps) {
	const mutation = useMutation({
		mutationFn: updateEvent,
		onSuccess,
	});

	const form = useForm({
		defaultValues: {
			title: event.title,
			description: event.description,
			time: event.time.toISOString(),
			location: event.location,
		} as z.infer<typeof EventInputSchema>,
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
							EventInputSchema.shape.title,
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
							EventInputSchema.shape.description,
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
				name="time"
				validators={{
					onBlur: ({ fieldApi }) => {
						const errors = fieldApi.parseValueWithSchema(
							EventInputSchema.shape.time,
						);
						return errors;
					},
				}}
				children={(field) => (
					<>
						<label htmlFor="time">Time</label>
						<input
							id="time"
							type="datetime-local"
							value={
								field.state.value
									? new Date(field.state.value).toISOString().slice(0, 16)
									: ""
							}
							onBlur={field.handleBlur}
							onChange={(e) =>
								field.handleChange(new Date(e.target.value).toISOString())
							}
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
							EventInputSchema.shape.location,
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
