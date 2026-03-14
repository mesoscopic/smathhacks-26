import * as Tone from "tone";

export function play_music() {
  const bass_synth = new Tone.Synth();
  const distortion = new Tone.Distortion(0.7).toDestination();
  bass_synth.connect(distortion);

  const treble_synth = new Tone.Synth().toDestination();

  const bass_loop = new Tone.Loop((time) => {
    bass_synth.triggerAttackRelease("G2", "4n", time);
  }, "4n").start(0);
  const treble_loop = new Tone.Loop((time) => {
    treble_synth.triggerAttackRelease("D#4", "8n", time);
  }, "4n").start("8n");

  Tone.getTransport().start();

  Tone.getTransport().bpm.rampTo(60,1);

}
