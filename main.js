const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false, // Добавлено
      nodeIntegration: true,    // Изменено на true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);


ipcMain.handle('download-video', async (event, url) => {
  const mainWindow = BrowserWindow.getFocusedWindow();

  if (!ytdl.validateURL(url)) {
    return { error: 'Некорректный URL YouTube' };
  }

  //dev tools

  const videoID = ytdl.getURLVideoID(url);
  const info = await ytdl.getInfo(videoID);
  const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${title}.mp4`,
    filters: [{ name: 'MP4 Files', extensions: ['mp4'] }]
  });

  if (!filePath) {
    return { error: 'Загрузка отменена' };
  }

  const stream = ytdl(url, {
    filter: 'videoandaudio',
    format: 'mp4',
    quality: 'highest',
  }).pipe(fs.createWriteStream(filePath));

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('Скачивание завершено');
      resolve({ filePath });
    });

    stream.on('error', (err) => {
      console.error('Ошибка при скачивании:', err);
      reject({ error: 'Ошибка при скачивании видео' });
    });
  });
});
