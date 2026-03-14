import { EventType } from "./main.ts"
import { LatLng } from "./structs.ts"

export class LocationEvent implements EventType<LatLng> { data: LatLng }
export class DummyEvent implements EventType<number> { data: number }
