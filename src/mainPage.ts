const audio = document.getElementById('bgAudio') as HTMLAudioElement | null;
const volumeSlider = document.getElementById('volume') as HTMLInputElement | null;
const muteBtn = document.getElementById('muteBtn') as HTMLButtonElement | null;

if (audio && volumeSlider && muteBtn) {
  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? 'Unmute' : 'Mute';
    if (!audio.muted && audio.volume === 0) {
      audio.volume = 1;
      volumeSlider.value = '1';
    }
  });
} else {
  console.error('Required audio controls not found in the DOM.');
}
