import { getAllEvents } from "@/server/event";
import { useQuery } from "@tanstack/react-query";

export default function EventsTest() {
	const {
		isPending,
		isError,
		data: events,
		error,
	} = useQuery({
		queryKey: ["events"],
		queryFn: getAllEvents,
	});

	if (isPending) {
		return <div>Loading events...</div>;
	}
	if (isError) {
		return <div>Error loading events: {String(error)}</div>;
	}

	return (
		<div>
			<h1>Events Test Component</h1>
			<p>This is a test component for events.</p>
			{events.length === 0 ? (
				<p>No events available.</p>
			) : (
				events.map((event) => (
					<div
						key={event.id}
						style={{
							border: "1px solid black",
							margin: "10px",
							padding: "10px",
						}}
					>
						<h2>{event.title}</h2>
						<p>{event.description}</p>
						<p>
							<strong>Time:</strong> {new Date(event.time).toLocaleString()}
						</p>
						<p>
							<strong>Location:</strong> {event.location}
						</p>
						<p>
							<strong>Price:</strong> {event.price}
						</p>
					</div>
				))
			)}
		</div>
	);
}
