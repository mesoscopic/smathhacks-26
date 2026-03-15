import * as Tone from "tone";
import {Event} from "../data/events";

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
export var a_volume = -8;  // Volume is weird AF, why is quiet -30 and 0 is loud?

var a_loop = new Tone.Loop((time) => {
  a.triggerAttackRelease(chords[key[progression[a_note]]].map((g) => g + a_octave), "8n", time);
  a_note = (a_note + 1) % progression.length;
}, "4n");

a.volume.value = a_volume;

const reverb = new Tone.Reverb(0.3).toDestination();
a.connect(reverb);


export function play_music(event: Event) {
  // console.log("Event Received");
  switch(event.type) {
  case "new_data": 
    a_loop.start()

    Tone.getTransport().bpm.value = a_tempo;
    Tone.getTransport().start();
  break
  case "dummy":
    a_octave = (event.random * 3 + 1).toPrecision(1);
    // console.log((event.random * 3 + 1).toPrecision(1));
  break
  case "location": 
    // console.log("Location Event", event.location);
  }
}
