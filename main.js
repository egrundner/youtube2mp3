const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let outputPath = app.getPath('downloads');

function getYtDlpPath() {
  if (app.isPackaged) {
    const resourcesPath = process.resourcesPath;
    const bundledYtDlp = path.join(resourcesPath, 'yt-dlp');
    if (require('fs').existsSync(bundledYtDlp)) {
      return bundledYtDlp;
    }
    try {
      const systemYtDlp = require('child_process').execSync('which yt-dlp', { encoding: 'utf8' }).trim();
      if (systemYtDlp && require('fs').existsSync(systemYtDlp)) {
        return systemYtDlp;
      }
    } catch (e) {}
    return 'yt-dlp';
  }
  return 'yt-dlp';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      outputPath = result.filePaths[0];
      return outputPath;
    }
    return null;
  } catch (e) {
    console.error('Folder dialog error:', e);
    return null;
  }
});

ipcMain.handle('get-output-path', () => {
  return outputPath;
});

ipcMain.handle('download-mp3', async (event, videoUrl) => {
  return new Promise((resolve, reject) => {
    if (!videoUrl || (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
      reject(new Error('Ungültige YouTube URL'));
      return;
    }

    const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');

    mainWindow.webContents.send('progress', { status: 'Starte Download...', percent: 5 });

    const args = [
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputTemplate,
      '--no-playlist',
      videoUrl
    ];

    const ytDlpPath = getYtDlpPath();
    console.log('Running yt-dlp:', ytDlpPath, 'with args:', args.join(' '));

    const ytProcess = spawn(ytDlpPath, args);

    let stderrOutput = '';
    let stdoutOutput = '';

    ytProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderrOutput += text;
      console.log('yt-dlp:', text.trim());
    });

    ytProcess.stdout.on('data', (data) => {
      stdoutOutput += data.toString();
    });

    ytProcess.on('close', (code) => {
      console.log('yt-dlp exit code:', code);
      
      if (code === 0) {
        mainWindow.webContents.send('progress', { status: 'Fertig!', percent: 100 });
        resolve({ success: true, folder: outputPath });
      } else {
        const errorMsg = stderrOutput.trim() || stdoutOutput.trim() || 'Download fehlgeschlagen';
        reject(new Error(errorMsg));
      }
    });

    ytProcess.on('error', (err) => {
      console.error('yt-dlp error:', err);
      reject(new Error('yt-dlp nicht gefunden: ' + err.message));
    });

    let progressSent = 10;
    const progressInterval = setInterval(() => {
      if (progressSent < 70) {
        progressSent += 15;
        mainWindow.webContents.send('progress', { status: 'Lade herunter...', percent: progressSent });
      }
    }, 800);

    ytProcess.on('close', () => {
      clearInterval(progressInterval);
    });
  });
});

ipcMain.handle('open-folder', () => {
  shell.openPath(outputPath);
});