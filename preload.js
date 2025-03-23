// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTimerUpdate: (callback) => ipcRenderer.on('timer-update', callback),
  startTimer: () => ipcRenderer.send('start-timer'),
  pauseTimer: () => ipcRenderer.send('pause-timer'),
  stopTimer: () => ipcRenderer.send('stop-timer'),
  startBreak: () => ipcRenderer.send('start-break'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});