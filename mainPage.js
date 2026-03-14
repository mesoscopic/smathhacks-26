var audio = document.getElementById('bgAudio');
var volumeSlider = document.getElementById('volume');
var muteBtn = document.getElementById('muteBtn');
if (audio && volumeSlider && muteBtn) {
    volumeSlider.addEventListener('input', function () {
        audio.volume = parseFloat(volumeSlider.value);
    });
    muteBtn.addEventListener('click', function () {
        audio.muted = !audio.muted;
        muteBtn.textContent = audio.muted ? 'Unmute' : 'Mute';
        if (!audio.muted && audio.volume === 0) {
            audio.volume = 1;
            volumeSlider.value = '1';
        }
    });
}
else {
    console.error('Required audio controls not found in the DOM.');
}
