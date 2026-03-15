import * as Events from "./events";
import { LatLng } from "./structs";

export { Events }

type Timeout = ReturnType<typeof setTimeout>

const DUMMY_POLL_TIME = 100
let dummyPoll: Timeout | null = null

let noaaPoll: Timeout | null = null
let buoyPositions = {}

const OBIS_API_ROOT = "https://api.obis.org/v3"
let obisPoll: Timeout | null = null

let currentLocation: LatLng | null = null

let dataCallback: Function | null = null

// Overrides previous callback.
export async function stream(location: LatLng, callback: Function) {
	dataCallback = callback;
	await getBuoyPositions();
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

async function getBuoyPositions() {
	let buoys = (await (await fetch("/buoys")).text()).split("\n");
	for (let i in buoys) {
		let data = buoys[i].split("\t")
		buoyPositions[data[0]] = [parseFloat(data[1]), parseFloat(data[2])] as LatLng;
	}
	console.log(buoyPositions)
}

async function pollNOAA() {

}
