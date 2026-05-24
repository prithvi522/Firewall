const { app, BrowserWindow } = require('electron')
const path = require('path')

// Start backend when running the Electron app in dev or packaged mode.
try {
  require('./backend_launcher');
} catch (e) {
  // ignore if launcher is not present or fails; backend may already be running.
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the frontend dev server or the built index.html
  const devUrl = 'http://localhost:5173'
  win.loadURL(devUrl).catch(() => {
    win.loadFile(path.join(__dirname, 'index.html'))
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
