import { play_music } from "./music/main"
import * as Data from "./data/main"

let mapClicked = false;

/*
function handleClick(event: MouseEvent): void {
	console.log("Button clicked!");
	play_music({ type: "new_data" });
	// Optional: use the event object, e.g., to prevent default behavior
	event.preventDefault();
}
*/

document.addEventListener('DOMContentLoaded', () => {
	/*
	const button = document.getElementById("myButton");
	if (button) {
		// Use addEventListener and pass the function reference
		button.addEventListener('click', handleClick);
	}
	*/

	const image = document.getElementById('targetImage') as HTMLImageElement | null;
	const displayedCoordsElement = document.getElementById('displayedCoords') as HTMLElement | null;
	const originalCoordsElement = document.getElementById('originalCoords') as HTMLElement | null;

	if (!image || !displayedCoordsElement || !originalCoordsElement) {
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

		const marker = document.getElementById('markerImage') as HTMLImageElement | null;
		if (!marker) return;

		// Get the image's position and size relative to the viewport
		const rect = target.getBoundingClientRect();

		// Calculate click coordinates relative to the image's top-left corner
		const displayedX = event.clientX - rect.left;
		const displayedY = event.clientY - rect.top;

		marker.style.display = 'block';
		marker.style.left = `${displayedX}px`;
		marker.style.top = `${displayedY + 50}px`;

		// Round to 2 decimal places for readability
		displayedCoordsElement.textContent = `X: ${displayedX.toFixed(2)}, Y: ${displayedY.toFixed(2)}`;

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

		function pixelToLatLon(x: number, y: number): { lat: number; lon: number } {
			const width = 4095;
			const height = 1946;

			const lat = 90 - (y / height) * 180;
			const lon = -180 + (x / width) * 360;

			return { lat, lon };
		}
		const latitude = pixelToLatLon(originalX, originalY).lat
		const longitude = pixelToLatLon(originalX, originalY).lon

		console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

		if (!mapClicked) {
			mapClicked = true;
			Data.stream([latitude, longitude], play_music)
			play_music({ type: "new_data" });
		}

		originalCoordsElement.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
		// originalCoordsElement.textContent = `X: ${originalX.toFixed(2)}, Y: ${originalY.toFixed(2)}`;
	}

	function moveSubToLocation(): void {


	}

});