import { EventType } from "./main"
import { LatLng } from "./structs"

export class LocationEvent implements EventType { data: LatLng }
export class DummyEvent implements EventType { data: number }
