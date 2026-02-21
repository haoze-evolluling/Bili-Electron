const { app, BrowserWindow, session } = require('electron');
const WindowConfig = require('./window/window-config');
const PageLoader = require('./window/page-loader');

let mainWindow;

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
  const filter = { urls: ['*://*.bilibili.com/*'] };
  
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    details.requestHeaders['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    callback({ requestHeaders: details.requestHeaders });
  });
}

function setupAppEvents() {
  app.whenReady().then(() => {
    setupRequestHeaders();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
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
