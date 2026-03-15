import * as Tone from "tone";
import {Event} from "../data/events";
import { volume } from "../main";

const chords: Record<string,string[]> = {
  "A": ["A", "C", "E"],
  "B": ["B", "Db", "F"],
  "C": ["C", "Eb", "G"],
  "D": ["D", "F", "A"],
  "E": ["E", "Gb", "B"],
  "F": ["F", "Ab", "C"],
  "G": ["G", "Bb", "D"],
}
var key= ["A", "B", "C", "D", "E", "F", "G"];

const a = new Tone.PolySynth();

var a_note = 0;
var progression = [0,1,2,3,4,5,6];
var a_tempo = 90;
var a_octave = "1";

var a_loop = new Tone.Loop((time) => {
  // a.triggerAttackRelease(chords[key[progression[a_note]]].map((g) => g + a_octave), "8n", time);
  // 

  arpeggio(
    a,
    chords[key[progression[a_note]]].map((g) => g + a_octave),
    0.05,
    time,
    "4n.",
  )
  a_note = (a_note + 1) % progression.length;
}, "2n");

const reverb = new Tone.Reverb(0.3);
a.connect(reverb);

const toneVolume = new Tone.Volume().toDestination();
reverb.connect(toneVolume);




export function play_music(event: Event) {
  // console.log("Event Received");
  switch(event.type) {
  case "new_data": 
    a_loop.start()

  Tone.getTransport().start();

  Tone.getTransport().bpm.value = a_tempo;
    console.log(a_tempo);
  break
  case "dummy":
    a_octave = (event.random * 3 + 1).toPrecision(1);
    toneVolume.volume.value = volume;
    // console.log((event.random * 3 + 1).toPrecision(1));
  break
  case "location": 
    // console.log("Location Event", event.location);
  break
  case "buoy":
    console.log("Buoy event", event.data);

    a_tempo = 60 + Math.round(event.data.wavePeriod * 20);

    console.log(a_tempo);

  Tone.getTransport().bpm.value = a_tempo;

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
