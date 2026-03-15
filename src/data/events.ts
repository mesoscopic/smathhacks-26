import { LatLng, BuoyData } from "./structs"

export type Event =
	{ type: "location", location: LatLng } |
	{ type: "dummy", random: number } |
	{ type: "buoy", data: BuoyData } |
	{ type: "new_data" }
