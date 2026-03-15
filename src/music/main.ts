import * as Tone from "tone";
import {EventType} from "../data/main";
import {NewDataEvent, DummyEvent} from "../data/events";

const chords: Record<string,string[]> = {
  "E": ["E", "G#", "B"]
}

const a = new Tone.PolySynth();

var a_note = "E";
var a_tempo = 90;
var a_octave = "1";

var a_loop = new Tone.Loop((time) => {
  a.triggerAttackRelease(chords[a_note].map((g) => g + a_octave), "4n", time);
}, "4n");

const reverb = new Tone.Reverb(1).toDestination();
a.connect(reverb);


export function play_music(event: EventType) {
  if (event instanceof NewDataEvent) {
    a_loop.start()

    Tone.getTransport().bpm.value = a_tempo;
    Tone.getTransport().start();
  } else if (event instanceof DummyEvent) {
    a_octave = (event.data * 8).toPrecision(1);
    console.log((event.data * 8).toPrecision(1));
  }
}
