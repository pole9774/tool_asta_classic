
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { init: initDb } = require('./db/sqlite');
require('./db/api');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../assets/Soccer_icon.ico'),
  });
  win.loadFile(path.join(__dirname, '../dist/index.html'));
}


app.whenReady().then(() => {
  initDb();
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
