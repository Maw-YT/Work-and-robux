export function setupUI() {
  const musicToggleButton = document.getElementById('musicToggleButton');
  const backgroundMusic = document.getElementById('backgroundMusic');

  musicToggleButton.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  });
}

