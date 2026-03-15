import { play_music } from "./music/main"
import * as Data from "./data/main"

let mapClicked = false;
let mapWidth = 4096;
let mapHeight = 1936;
export var volume = -8;


/*
function handleClick(event: MouseEvent): void {
	console.log("Button clicked!");
	play_music({ type: "new_data" });
	// Optional: use the event object, e.g., to prevent default behavior
	event.preventDefault();
}
*/

function pixelToLatLong(x: number, y: number): { lat: number; long: number } {
	const lat = 90 - (y / mapHeight) * 180;
	const long = -180 + (x / mapWidth) * 360;

	return { lat, long };
}

document.addEventListener('DOMContentLoaded', () => {

	let isMuted = false;
	const muteButton = document.getElementById("muteBtn");
	muteButton.addEventListener('click', function() {
		if (!isMuted) {
			volume = -50;
			muteButton.textContent = "Muted";
		}
		else {
			volume = volumeSlider.valueAsNumber;
			muteButton.textContent = "Unmuted";
		}
		isMuted = !isMuted
	});

	const volumeSlider = document.getElementById('volume') as HTMLInputElement | null;
	volumeSlider.addEventListener("change", function() {
		volume = volumeSlider.valueAsNumber;
	});


	const image = document.getElementById('targetImage') as HTMLImageElement | null;
	//const displayedCoordsElement = document.getElementById('displayedCoords') as HTMLElement | null;
	const originalCoordsElement = document.getElementById('originalCoords') as HTMLElement | null;
	const marker = document.getElementById('markerImage') as HTMLImageElement | null;

	if (!image || !originalCoordsElement || !marker) {
		console.error("One or more required elements are missing from the DOM.");
		return;
	}

	// Ensure the image is fully loaded before calculating coordinates
	image.addEventListener('load', () => {
		// Add click event listener to the image
		image.addEventListener('click', handleImageClick);
	});

	// Fallback: If the image is cached, 'load' event may not fire automatically
	if (image.complete) {
		image.dispatchEvent(new Event('load'));
	}

	function handleImageClick(event: MouseEvent): void {
		const target = event.target as HTMLImageElement;
		if (!target) return;

		// Get the image's position and size relative to the viewport
		const rect = target.getBoundingClientRect();

		// Calculate click coordinates relative to the image's top-left corner
		const displayedX = event.clientX - rect.left;
		const displayedY = event.clientY - rect.top;

		// Round to 2 decimal places for readability
		//displayedCoordsElement.textContent = `X: ${displayedX.toFixed(2)}, Y: ${displayedY.toFixed(2)}`;

		// Get original image dimensions (from the image file)
		const originalWidth = target.naturalWidth;
		const originalHeight = target.naturalHeight;

		// Get displayed image dimensions (on-screen size)
		const displayedWidth = target.offsetWidth;
		const displayedHeight = target.offsetHeight;

		// Calculate scaling factors (original / displayed)
		const scaleX = originalWidth / displayedWidth;
		const scaleY = originalHeight / displayedHeight;

		// Convert displayed coordinates to original image coordinates
		const originalX = displayedX * scaleX;
		const originalY = displayedY * scaleY;

		const latitude = pixelToLatLong(originalX, originalY).lat
		const longitude = pixelToLatLong(originalX, originalY).long

		moveSubToLocation(latitude, longitude, scaleX, scaleY, true);

		//console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

		if (!mapClicked) {
			mapClicked = true;
			marker.style.display = 'block';
			currentMoving()
			Data.stream([longitude, latitude], play_music)
			play_music({ type: "new_data" });
		}

		originalCoordsElement.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
		// originalCoordsElement.textContent = `X: ${originalX.toFixed(2)}, Y: ${originalY.toFixed(2)}`;


		function moveSubToLocation(lat: number, long: number, scaleX: number, scaleY: number, isClick: boolean): void {
			Data.pollLocation([lat, long]);

			lat = (((90 - lat) / 180) * mapHeight) / scaleY;
			long = (((long + 180) / 360) * mapWidth) / scaleX;

			let currentLeft = parseFloat(marker.style.left) || 0;
			let currentTop = parseFloat(marker.style.top) || 0;

			const speed = 0.01;

			if (!isClick) {
				animate()
			}
			else {
				marker.style.top = `${lat + 50}px`;
				marker.style.left = `${long}px`;
				//currentMoving()
			}

			function animate() {
				// Calculate distance left
				const deltaTop = (lat + 50) - currentTop;
				const deltaLeft = long - currentLeft;

				// Flips Sub Marine
				if (0 > deltaLeft) marker.style.transform = 'translate(-50%, -50%) scaleX(-1)';
				else marker.style.transform = 'translate(-50%, -50%) scaleX(1)';

				// Stop if close enough
				if (Math.abs(deltaTop) < 0.5 && Math.abs(deltaLeft) < 0.5) {
					marker.style.top = `${lat + 50}px`;
					marker.style.left = `${long}px`;

					currentMoving()

					return;
				}

				// Move fractionally toward target
				currentTop += deltaTop * speed;
				currentLeft += deltaLeft * speed;

				marker.style.top = `${currentTop}px`;
				marker.style.left = `${currentLeft}px`;

				requestAnimationFrame(animate);
			}
		}

		async function currentMoving() {
			const currentVectors = await Data.getCurrentVector();

			let currentLeft = parseFloat(marker.style.left) || 0;
			let currentTop = parseFloat(marker.style.top) || 0;

			const displayedWidth = image.offsetWidth;
			const displayedHeight = image.offsetHeight;
			const originalWidth = image.naturalWidth;
			const originalHeight = image.naturalHeight;
			const scaleX = originalWidth / displayedWidth;
			const scaleY = originalHeight / displayedHeight;

			const originalX = currentLeft * scaleX;
			const originalY = (currentTop - 50) * scaleY;

			let lat = pixelToLatLong(originalX, originalY).lat;
			let long = pixelToLatLong(originalX, originalY).long;


			// These are exagerated values
			const moveHorizontallyBy = currentVectors[0] * 2;
			const moveVerticallyBy = currentVectors[1] * 2;

			originalCoordsElement.textContent = `Latitude: ${lat}, Longitude: ${long}`;
			moveSubToLocation((lat + moveVerticallyBy), (long + moveHorizontallyBy), scaleX, scaleY, false)
		}
	}
});
