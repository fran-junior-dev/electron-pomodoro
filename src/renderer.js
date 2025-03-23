// renderer.js
const timerElement = document.getElementById('timer');
const statusElement = document.getElementById('status');
const playPauseButton = document.getElementById('play-pause-btn');
const stopButton = document.getElementById('stop-btn');
const petImage = document.getElementById('pet-image');
const petSwitch = document.getElementById('pet-switch');

const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');

// Check if electronAPI is available
if (window.electronAPI) {
  minimizeBtn.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });

  maximizeBtn.addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
  });

  closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });
} else {
  console.error('electronAPI is not available');
}

let timeLeft = 25 * 60; // 1 minute for testing (change to 25 * 60 for production)
let isRunning = false;
let isBreak = false;
let isCat = true; // Default pet is cat

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function showButtons() {
  playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
  stopButton.classList.remove('hidden');
}

function hideButtons() {
  playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
  stopButton.classList.add('hidden');
}

function updatePet() {
  if (isBreak) {
    petImage.src = isCat ? 'assets/cat-sleeping.gif' : 'assets/dog-sleeping.gif';
  } else {
    petImage.src = isCat ? 'assets/cat-active.gif' : 'assets/dog-active.gif';
  }
}

if (window.electronAPI) {
  playPauseButton.addEventListener('click', () => {
    if (isRunning) {
      window.electronAPI.pauseTimer();
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      window.electronAPI.startTimer();
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
      stopButton.classList.remove('hidden');
    }
    isRunning = !isRunning;
  });

  stopButton.addEventListener('click', () => {
    window.electronAPI.stopTimer();
    hideButtons();
    isRunning = false;
  });

  petSwitch.addEventListener('change', () => {
    isCat = !isCat;
    updatePet();
  });

  window.electronAPI.onTimerUpdate((event, time, status, isBreakSession) => {
    timeLeft = time;
    statusElement.textContent = status;
    isBreak = isBreakSession;
    updateTimer();
    updatePet();
  });
} else {
  console.error('electronAPI is not available');
}

updateTimer();
updatePet();