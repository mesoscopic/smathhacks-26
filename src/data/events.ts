import { LatLng, BuoyData } from "./structs"

export type Event =
	{ type: "location", location: LatLng } |
	{ type: "current", vector: [number, number] } |
	{ type: "dummy", random: number } |
	{ type: "buoy", data: BuoyData } |
	{ type: "new_data" }
