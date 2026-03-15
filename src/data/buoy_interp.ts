import { LatLng, BuoyData } from "./structs"
import * as natninter from "natninter"

const interpolator = new natninter.Interpolator();
const MIN_WEIGHT = 0.1;

export async function setup(buoyPositions: object, width: number, height: number) {
	interpolator.setOutputSize(width, height);
	for (const buoy in buoyPositions) {
		interpolator.addSeed({ x: buoyPositions[buoy][0] + width / 2., y: buoyPositions[buoy][1] + height / 2., value: buoy });
	}
	interpolator._generateSeedCells();
	console.log(interpolator)
}

function getWeights(position: LatLng): object {
	const pixelCells = interpolator._generatePixelCells(
		position[0] + interpolator._output.width / 2., position[1] + interpolator._output.height / 2.);
	const areas = interpolator._seedCellCollection.getStolenAreaInfo(pixelCells);
	const weights = {};
	for (const i in areas) {
		if (areas[i].weight > MIN_WEIGHT) weights[interpolator._seeds[areas[i].seedIndex].value] = areas[i].weight;
	}
	return weights;
}

export async function getInterpolatedBuoyData(position: LatLng): Promise<BuoyData> {
	const weights = getWeights(position);
	const data: BuoyData = {
		waveHeight: 0,
		wavePeriod: 0,
		waterTemperature: 0,
		missingCount: 0
	};
	for (const buoy in weights) {
		const buoyData = (await (await fetch("/buoy/" + buoy)).text()).split("\t");
		console.log(buoy)
		console.log(buoyData);
		if (buoyData[8] == "MM") data.missingCount++;
		else data.waveHeight += weights[buoy] * parseFloat(buoyData[8]);
		if (buoyData[9] == "MM") data.missingCount++;
		else data.wavePeriod += weights[buoy] * parseFloat(buoyData[9]);
		if (buoyData[14] == "MM") data.missingCount++;
		else data.waterTemperature += weights[buoy] * parseFloat(buoyData[14]);
	}
	return data;
}
