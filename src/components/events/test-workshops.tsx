import { getAllWorkshops } from "@/server/workshop";

export default async function WorkshopsTest() {
	const workshops = await getAllWorkshops();
	return (
		<div>
			<h1>Workshops Test Component</h1>
			<p>This is a test component for workshops.</p>
			{workshops.length === 0 ? (
				<p>No workshops available.</p>
			) : (
				workshops.map((workshop) => (
					<div
						key={workshop.id}
						style={{
							border: "1px solid black",
							margin: "10px",
							padding: "10px",
						}}
					>
						<h2>{workshop.title}</h2>
						<p>{workshop.description}</p>
						<p>
							<strong>Time:</strong> {new Date(workshop.time).toLocaleString()}
						</p>
						<p>
							<strong>Location:</strong> {workshop.location}
						</p>
						<p>
							<strong>Price:</strong> {workshop.price}
						</p>
					</div>
				))
			)}
		</div>
	);
}
