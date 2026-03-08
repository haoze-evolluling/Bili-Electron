// 主进程入口，负责应用生命周期管理和窗口创建
const { app, BrowserWindow, session, ipcMain, globalShortcut } = require('electron');
const CONSTANTS = require('../common/constants');
const WindowConfig = require('./window/window-config');
const PageLoader = require('./window/page-loader');

// 配置 DNS over HTTPS (DoH)
app.commandLine.appendSwitch('dns-over-https', 'https://223.5.5.5/dns-query');

let mainWindow;
let isBossKeyHidden = false;

function createWindow() {
  mainWindow = new BrowserWindow(WindowConfig.mainWindowOptions);

  const pageLoader = new PageLoader(mainWindow);
  pageLoader.loadBilibiliHomepage();
  pageLoader.setupWindowEvents();
  pageLoader.showWhenReady();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupRequestHeaders() {
  const filter = { urls: [`*://*.${CONSTANTS.URLS.BILIBILI_DOMAIN}/*`] };
  
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Accept-Language'] = CONSTANTS.HEADERS.ACCEPT_LANGUAGE;
    details.requestHeaders['Accept'] = CONSTANTS.HEADERS.ACCEPT;
    callback({ requestHeaders: details.requestHeaders });
  });
}

function setupIpcHandlers() {
  ipcMain.on('close-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });

  ipcMain.on('minimize-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.minimize();
    }
  });
}

function setupBossKey() {
  const ret = globalShortcut.register('Alt+Z', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    if (isBossKeyHidden) {
      mainWindow.show();
      mainWindow.setOpacity(1);
      mainWindow.focus();
      isBossKeyHidden = false;
    } else {
      mainWindow.setOpacity(0);
      mainWindow.hide();
      isBossKeyHidden = true;
    }
  });

  if (!ret) {
    console.error('老板键注册失败：Alt+Z 快捷键可能被其他应用占用');
  }
}

function setupAppEvents() {
  app.whenReady().then(() => {
    setupRequestHeaders();
    setupIpcHandlers();
    setupBossKey();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}

function setupSingleInstance() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      }
    });
  }
}

setupSingleInstance();
setupAppEvents();
