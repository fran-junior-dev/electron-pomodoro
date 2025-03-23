// main.js
const { app, BrowserWindow, ipcMain, Notification, globalShortcut, screen } = require('electron');
const path = require('path');

let mainWindow;
let timerInterval;
let timeLeft = 25 * 60; // 1 minute for testing (change to 25 * 60 for production)
let isRunning = false;
let isBreak = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure this path is correct
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Add handlers for custom title bar buttons
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

function startTimer() {
  isRunning = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      timeLeft = 0;
      if (isBreak) {
        // Break over, wait for user interaction
        isBreak = false;
        new Notification({ title: 'Break Over', body: 'Focus time will start after interaction.' }).show();
        timeLeft = 25 * 60; // 1 minute focus for testing (change to 25 * 60 for production)
        waitForUserInteraction();
      } else {
        // Focus over, start break
        isBreak = true;
        timeLeft = 5 * 60; // 1 minute break for testing (change to 5 * 60 for production)
        new Notification({ title: 'Focus Over', body: 'Starting 5-minute break.' }).show();
        startTimer(); // Automatically start the break timer
      }
    }
    mainWindow.webContents.send('timer-update', timeLeft, isBreak ? 'Break Time' : 'Focus Time', isBreak);
  }, 1000);
}

function pauseTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isBreak = false;
  timeLeft = 25 * 60; // Reset to 1 minute for testing (change to 25 * 60 for production)
  mainWindow.webContents.send('timer-update', timeLeft, 'Focus Time', isBreak);
}

function waitForUserInteraction() {
  // Register global shortcuts for any key press
  globalShortcut.register('CommandOrControl+X', () => {
    globalShortcut.unregisterAll();
    startTimer();
  });

  // Detect mouse movement globally
  let lastMousePos = screen.getCursorScreenPoint();
  const checkMouseMovement = setInterval(() => {
    const currentMousePos = screen.getCursorScreenPoint();
    if (currentMousePos.x !== lastMousePos.x || currentMousePos.y !== lastMousePos.y) {
      clearInterval(checkMouseMovement);
      globalShortcut.unregisterAll();
      startTimer();
    }
    lastMousePos = currentMousePos;
  }, 100); // Check mouse position every 100ms
}

app.on('ready', () => {
  createWindow();
  // Register a dummy global shortcut to initialize the module
  globalShortcut.register('CommandOrControl+Y', () => {});
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('start-timer', startTimer);
ipcMain.on('pause-timer', pauseTimer);
ipcMain.on('stop-timer', stopTimer);