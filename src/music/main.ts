import * as Tone from "tone";
import { Event } from "../data/events";
import { volume } from "../main";

const chords: Record<string, string[]> = {
	"A": ["A", "C", "E"],
	"B": ["B", "Db", "F"],
	"C": ["C", "Eb", "G"],
	"D": ["D", "F", "A"],
	"E": ["E", "Gb", "B"],
	"F": ["F", "Ab", "C"],
	"G": ["G", "Bb", "D"],
}
var key = ["A", "B", "C", "D", "E", "F", "G"];

const chord_synth = new Tone.PolySynth();

var chord_progression = [0, 2, 4, 2, 0, 4, 6, 4];
var chord = 0;
var octave = 4;

var tempo = 90;

var chord_loop = new Tone.Loop((time) => {
	arpeggio(
		chord_synth,
		chords[key[chord_progression[chord]]].map((g) => g + octave),
		0.15,
		time,
		"4n.",
	)
	chord = (chord + 1) % chord_progression.length;
}, "1n");

const vibrato = new Tone.Vibrato(1, 0.05)
chord_synth.connect(vibrato);
const reverb = new Tone.Reverb(1.0);
vibrato.connect(reverb);
const delay = new Tone.PingPongDelay("3n", 0.25);
reverb.connect(delay);
const distortion = new Tone.Distortion(0.15);
delay.connect(distortion);
const toneVolume = new Tone.Volume().toDestination();
reverb.connect(toneVolume);
distortion.connect(toneVolume);




export function play_music(event: Event) {
	// console.log("Event Received");
	switch (event.type) {
		case "new_data":
			chord_loop.start()
			Tone.getTransport().bpm.value = tempo;
			Tone.getTransport().start();
			break
		case "dummy":
			//a_octave = (event.random * 3 + 1).toPrecision(1);
			toneVolume.volume.value = volume + 10;
			// console.log((event.random * 3 + 1).toPrecision(1));
			break
		case "location":
			// console.log("Location Event", event.location);
			break
		case "buoy":
			console.log("Buoy event", event.data);
			tempo = 60 + Math.round(event.data.wavePeriod * 20);
			Tone.getTransport().bpm.value = tempo;
			delay.set({ delayTime: "3n" })

			key = rotateArray(key, Math.round(event.data.waterTemperature * 10) % 7);

			console.log(key);
	}
}

function arpeggio(syn: any, chord: string[], delay: number, time: any, note_len: string) {
	for (let i = 0; i < chord.length; i++) {
		syn.triggerAttackRelease(chord[i], note_len, time + (delay * i));
	}
}

function rotateArray(arr, rotateBy) {
	const n = arr.length;
	rotateBy %= n;

	return arr.slice(rotateBy).concat(arr.slice(0, rotateBy));
}
