import * as Tone from "tone";

export function play_music() {
  const synth = new Tone.Synth().toDestination();
  const loop = new Tone.Loop(() => {
    synth.triggerAttackRelease("E2", "3n");
  }, "2n").start(0);
  Tone.getTransport().start();
}
