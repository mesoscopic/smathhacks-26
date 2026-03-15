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
var arpeggio_length = 0.15;

var tempo = 90;

var chord_loop = new Tone.Loop((time) => {
	arpeggio(
		chord_synth,
		chords[key[chord_progression[chord]]].map((g) => g + octave),
		arpeggio_length,
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
const lowpass = new Tone.Filter(2000, "lowpass")
distortion.connect(lowpass);
reverb.connect(lowpass);
lowpass.connect(toneVolume);

const wave_noise = new Tone.Noise("brown");
wave_noise.set({ volume: -15, fadeIn: 1, fadeOut: 1 });
const tremolo = new Tone.Tremolo(2, 1);
wave_noise.connect(tremolo);
tremolo.connect(toneVolume);

export function play_music(event: Event) {
	// console.log("Event Received");
	switch (event.type) {
		case "new_data":
			chord_loop.start()
			wave_noise.start()
			Tone.getTransport().bpm.value = tempo;
			Tone.getTransport().start();
			break
		case "dummy":
			//a_octave = (event.random * 3 + 1).toPrecision(1);
			toneVolume.volume.value = volume + 10;
			// console.log((event.random * 3 + 1).toPrecision(1));
			break
		case "current":
			const length = Math.sqrt(event.vector[0] ** 2 + event.vector[1] ** 2)
			tempo = Math.round(length * 200);
			Tone.getTransport().bpm.value = tempo;
			delay.set({ delayTime: "3n" })
			break
		case "buoy":
			console.log("Buoy event", event.data);
			vibrato.set({ depth: event.data.missingCount * 0.05, frequency: 1 / event.data.wavePeriod });
			tremolo.set({ frequency: 1 / event.data.wavePeriod })

			key = rotateArray(key, Math.round(event.data.waterTemperature * 10) % 7);
			octave = 2 + Math.round(event.data.waterTemperature / 10)
			arpeggio_length = event.data.wavePeriod / 8.;

			wave_noise.set({ volume: -15 + event.data.waveHeight * 2 });
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

const wave = new Tone.Waveform(1024);
Tone.getDestination().connect(wave);

function update_visualizer() {
	const wave_data = wave.getValue();

	drawWaveform(wave_data);

	requestAnimationFrame(update_visualizer);
}

Tone.loaded().then(update_visualizer);

const canvas = document.getElementById('waveform') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

resizeCanvas(canvas);

function drawWaveform(values): void {
  const { width, height } = canvas;
  const barWidth = width / values.length;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#FF0000';

  values.forEach((v, i) => {
    // v should be normalized: -1.0 to 1.0
    const barHeight = (v+1)/2 * height;
    ctx.fillRect(
      i * barWidth,
      height - barHeight,
      barWidth - 1,
      barHeight
    );
  });
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = 100;
}

window.addEventListener('resize', () => {
  resizeCanvas(canvas);
});
