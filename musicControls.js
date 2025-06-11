export const musicControls = {
  backgroundMusic: null,
  volumeSlider: null,
  volumeDisplay: null,

  init() {
    this.backgroundMusic = document.getElementById('backgroundMusic');
    this.volumeSlider = document.getElementById('musicVolumeSlider');
    this.volumeDisplay = document.getElementById('musicVolumeDisplay');
    
    this.setupMusicToggle();
    this.setupVolumeControl();
  },

  setupMusicToggle() {
    const musicToggleButton = document.getElementById('musicToggleButton');
    
    musicToggleButton.addEventListener('click', () => {
      if (this.backgroundMusic.paused) {
        this.backgroundMusic.play();
      } else {
        this.backgroundMusic.pause();
      }
    });
  },

  setupVolumeControl() {
    // Volume slider in start menu and game container
    const volumeSliders = document.querySelectorAll('#musicVolumeSlider');
    const volumeDisplays = document.querySelectorAll('#musicVolumeDisplay');

    volumeSliders.forEach((slider, index) => {
      slider.addEventListener('input', () => {
        const volume = slider.value / 100;
        this.backgroundMusic.volume = volume;
        
        // Update all volume displays to match
        volumeDisplays.forEach(display => {
          display.textContent = `${slider.value}%`;
        });
      });
    });
  }
};