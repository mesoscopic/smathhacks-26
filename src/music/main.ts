import * as Tone from "tone";
import {Event} from "../data/events";

const chords: Record<string,string[]> = {
  "E": ["E", "G#", "B"]
}

const a = new Tone.PolySynth();

var a_note = "E";
var a_tempo = 90;
var a_octave = "1";

var a_loop = new Tone.Loop((time) => {
  a.triggerAttackRelease(chords[a_note].map((g) => g + a_octave), "8n", time);
}, "4n");

const reverb = new Tone.Reverb(1).toDestination();
a.connect(reverb);


export function play_music(event: Event) {
  console.log("Event Received");
  switch(event.type) {
  case "new_data": 
    a_loop.start()

    Tone.getTransport().bpm.value = a_tempo;
    Tone.getTransport().start();
  break
  case "dummy":
    a_octave = (event.random * 8).toPrecision(1);
    console.log((event.random * 8).toPrecision(1));
  break
  case "location": 
    console.log("Location Event", event.location);
  }
}
