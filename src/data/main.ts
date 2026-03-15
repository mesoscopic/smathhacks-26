import * as Events from "./events";
import { LatLng } from "./structs";
import { setup, getInterpolatedBuoyData } from "./buoy_interp"

export { Events }

type Timeout = ReturnType<typeof setTimeout>

const DUMMY_POLL_TIME = 100
let dummyPoll: Timeout | null = null

const NOAA_POLL_TIME = 15 * 60000
let noaaPoll: Timeout | null = null
const buoyPositions = {}

const OBIS_API_ROOT = "https://api.obis.org/v3"
let obisPoll: Timeout | null = null

let currentLocation: LatLng | null = null

let dataCallback: Function | null = null

// Overrides previous callback.
export async function stream(location: LatLng, callback: Function) {
	dataCallback = callback;
	await getBuoyPositions();
	await setup(buoyPositions, 360, 180); // degree ranges
	pollLocation(location);
}

export function pollLocation(location: LatLng) {
	currentLocation = location;
	if (dataCallback != null) dataCallback({ type: "location", location });

	if (dummyPoll != null) clearTimeout(dummyPoll);
	pollDummy();

	if (noaaPoll != null) clearTimeout(noaaPoll);
	pollNoaa();
}

function pollDummy() {
	if (dataCallback != null) dataCallback({ type: "dummy", random: Math.random() });
	setTimeout(pollDummy, DUMMY_POLL_TIME);
}
async function pollNoaa() {
	if (dataCallback != null) dataCallback({ type: "buoy", data: await getInterpolatedBuoyData(currentLocation) })
	setTimeout(pollNoaa, NOAA_POLL_TIME);
}

async function getBuoyPositions() {
	let buoys = (await (await fetch("/buoys")).text()).split("\n");
	for (const i in buoys) {
		let data = buoys[i].split("\t")
		buoyPositions[data[0]] = [parseFloat(data[1]), parseFloat(data[2])] as LatLng;
	}
	console.log(buoyPositions)
}

export async function getCurrentVector(): Promise<[number, number]> {
	const strVector = (await (await fetch("/current/" + currentLocation.join(","))).text()).split(",");
	const vector: [number, number] = [parseFloat(strVector[0]) || 0, parseFloat(strVector[1]) || 0]
	dataCallback({ type: "current", vector });
	return vector;
	// Returns u_current, v_current
	// U is toward east
	// V is toward north
}
