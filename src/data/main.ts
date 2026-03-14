import * as Events from "./events.ts";
import { LatLng } from "./structs.ts";

export { Events }

let dummyPoll: number | null = null

const NOAA_API_ROOT = "https://www.ncei.noaa.gov/access/services/data/v1"
let noaaPoll: number | null = null

const OBIS_API_ROOT = "https://api.obis.org/v3"
let obisPoll: number | null = null

let currentLocation: LatLng | null = null

let dataCallback: Function | null = null

// Overrides previous callback.
export function stream(location: LatLng, callback: Function): void {
	dataCallback = callback;
	pollLocation(location);
}

export function pollLocation(location: LatLng) {
	currentLocation = location;
	if (dataCallback != null) dataCallback({ data: location } as Events.LocationEvent);

	if (dummyPoll != null) clearInterval(dummyPoll);
	dummyPoll = setInterval(() => { pollDummy(currentLocation as LatLng); }, 100);
}

export interface EventType<T> {
	data: T
}

function pollDummy(location: LatLng) {
	if (dataCallback != null) dataCallback({ data: Math.random() } as Events.DummyEvent);
}
