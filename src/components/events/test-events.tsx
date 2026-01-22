import { getAllEvents } from "@/server/event";

export default async function EventsTest() {
	const events = await getAllEvents();
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
