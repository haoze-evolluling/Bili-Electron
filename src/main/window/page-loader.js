const { shell } = require('electron');
const CONSTANTS = require('../../common/constants');
const WindowConfig = require('./window-config');

class PageLoader {
  constructor(window) {
    this.window = window;
  }

  loadBilibiliHomepage() {
    this.window.loadURL(CONSTANTS.URLS.BILIBILI_HOME, {
      userAgent: WindowConfig.userAgent
    });
  }

  handleWindowOpen() {
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      if (WindowConfig.isInternalUrl(url)) {
        this.window.loadURL(url, { userAgent: WindowConfig.userAgent });
        return { action: 'deny' };
      }

      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  handleNavigation() {
    this.window.webContents.on('will-navigate', (event, url) => {
      if (!WindowConfig.isInternalUrl(url)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  }

  setupWindowEvents() {
    this.window.setMenuBarVisibility(false);
    this.window.setAutoHideMenuBar(true);
    this.handleWindowOpen();
    this.handleNavigation();
  }

  showWhenReady() {
    this.window.once('ready-to-show', () => {
      this.window.show();
      if (process.argv.includes('--dev')) {
        this.window.webContents.openDevTools();
      }
    });
  }
}

module.exports = PageLoader;
