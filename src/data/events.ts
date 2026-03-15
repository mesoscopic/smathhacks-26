import { LatLng } from "./structs"

export type Event =
	{ type: "location", location: LatLng } |
	{ type: "dummy", random: number } |
	{ type: "new_data" }
