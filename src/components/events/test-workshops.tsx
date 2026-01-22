import { getAllWorkshops } from "@/server/workshop";
import { useQuery } from "@tanstack/react-query";

export default function WorkshopsTest() {
	const {
		isPending,
		isError,
		data: workshops,
		error,
	} = useQuery({
		queryKey: ["workshops"],
		queryFn: getAllWorkshops,
	});

	if (isPending) {
		return <div>Loading workshops...</div>;
	}
	if (isError) {
		return <div>Error loading workshops: {String(error)}</div>;
	}

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
