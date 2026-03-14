const NOAA_API_ROOT = "https://www.ncei.noaa.gov/access/services/data/v1"
let pollingNoaa = false

const OBIS_API_ROOT = "https://api.obis.org/v3"
let pollingObis = false

let dataCallback: Function | null = null

// Overrides previous callback.
export function stream(callback: Function): void {
	dataCallback = callback;
	if (!pollingNoaa) startPollingNoaa();
	//if (!pollingObis) startPollingObis();
}

export type Event = {
	type: EventType,
	data: number
}

export enum EventType {

}

function startPollingNoaa(): void {
	pollingNoaa = true
}

function startPollingObis(): void {

}
