export const HOSTELS = [
	"Agate",
	"Garnet A",
	"Garnet B",
	"Garnet C",
	"Zircon A",
	"Zircon B",
	"Zircon C",
	"Beryl",
	"Amber A",
	"Amber B",
	"Coral",
	"Aquamarine A",
	"Aquamarine B",
	"Ruby",
	"Emerald",
	"Pearl",
	"Sapphire",
	"Topaz",
	"Lapis",
	"Diamond",
	"Jade",
	"Jasper",
	"Amethyst",
	"Opal A",
	"Opal B",
	"Opal C",
	"Opal D",
	"Opal E",
	"Opal F",
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
