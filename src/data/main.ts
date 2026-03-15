import * as Events from "./events";
import { LatLng } from "./structs";

export { Events }

type Timeout = ReturnType<typeof setTimeout>

const DUMMY_POLL_TIME = 100
let dummyPoll: Timeout | null = null

const NOAA_API_ROOT = "https://www.ndbc.noaa.gov/data/realtime2"
let noaaPoll: Timeout | null = null
let buoys = {}

const OBIS_API_ROOT = "https://api.obis.org/v3"
let obisPoll: Timeout | null = null

let currentLocation: LatLng | null = null

let dataCallback: Function | null = null

// Overrides previous callback.
export async function stream(location: LatLng, callback: Function) {
	dataCallback = callback;
	await getBuoyData();
	pollLocation(location);
}

export function pollLocation(location: LatLng) {
	currentLocation = location;
	if (dataCallback != null) dataCallback({ type: "location", location });

	if (dummyPoll != null) clearTimeout(dummyPoll);
	dummyPoll = setTimeout(() => { pollDummy(currentLocation as LatLng); }, DUMMY_POLL_TIME);
}

export interface EventType {
	data: any
}

function pollDummy(location: LatLng) {
	if (dataCallback != null) dataCallback({ type: "dummy", random: Math.random() });
	setTimeout(() => { pollDummy(location) }, DUMMY_POLL_TIME);
}

async function getBuoyData() {
	let buoysHTML = await fetch("https://www.ndbc.noaa.gov/data/realtime2/");
	(await buoysHTML.text()).split("\n").filter((line: string) => line.includes("\.txt")).map((line: string) => line.match(/href=\"([A-Z0-9]+).txt\"/));
}
async function pollNOAA() {

}
