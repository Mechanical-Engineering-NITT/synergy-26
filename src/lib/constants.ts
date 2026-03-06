export const HOSTELS = [
	"Zircon A",
	"Zircon B",
	"Zircon C",
	"Opal A",
	"Garnet C",
] as const;

export const FLOORS = [
	"Ground Floor",
	"First Floor",
	"Second Floor",
	"Third Floor",
	"Fourth Floor",
] as const;

export type Floor = (typeof FLOORS)[number];
export type Hostel = (typeof HOSTELS)[number];
