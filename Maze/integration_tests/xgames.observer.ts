import {app, BrowserWindow, ipcMain} from 'electron';
import {ChildProcess, fork} from 'child_process';
import {GameUpdate} from '../Referee/ProcessObserver';
import {join} from 'path';
import {XGamesChannel} from '../test_utility/XGamesChannel';

const HTML_PATH = '../observer-gui/build/index.html';

const XGAMES_PATH = join(__dirname, 'xgames.js');

const WIDTH = 1000;
const HEIGHT = 1000;

/**
 * Create a referee in a child process to run the game.
 * This ensures the UI stays responsive during the game.
 *
 * Pass messages from the child process to a given callback.
 */
let xgamesProcess: ChildProcess | undefined;
function forkProcess(callback: (data: unknown) => void) {
  xgamesProcess = fork(XGAMES_PATH, ['--observer']);
  xgamesProcess.on('message', callback);
}

/**
 * Create the application window and set associated
 * handlers.
 *
 * Also call {@link forkProcess} once the window is ready.
 */
let mainWindow: BrowserWindow | null = null;
const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // and load the index.html of the app.
  await mainWindow.loadFile(HTML_PATH);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let updateBuffer: GameUpdate[] = [];
app.whenReady().then(async () => {
  await createWindow();

  forkProcess(data => {
    updateBuffer.push(data as GameUpdate);
  });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  mainWindow?.on('close', () => {
    mainWindow = null;
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  xgamesProcess?.kill('SIGINT');
});

ipcMain.on(XGamesChannel.GET_UPDATES, () => {
  mainWindow?.webContents.send(XGamesChannel.UPDATES, updateBuffer);
  updateBuffer = [];
});
