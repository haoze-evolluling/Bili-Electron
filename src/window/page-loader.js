const { shell } = require('electron');
const WindowConfig = require('./window-config');

class PageLoader {
  constructor(window) {
    this.window = window;
  }

  loadBilibiliHomepage() {
    this.window.loadURL('https://www.bilibili.com', {
      userAgent: WindowConfig.userAgent
    });
  }

  injectScrollBarCSS() {
    this.window.webContents.on('dom-ready', () => {
      this.window.webContents.insertCSS(WindowConfig.scrollBarCSS);
    });
  }

  handleWindowOpen() {
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      if (WindowConfig.isInternalUrl(url)) {
        return { action: 'allow' };
      }
      
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  handleNavigation() {
    this.window.webContents.on('will-navigate', (event, url) => {
      if (WindowConfig.isInternalUrl(url)) {
        return;
      }
      
      event.preventDefault();
      shell.openExternal(url);
    });
  }

  setupWindowEvents(parentWindow = null) {
    if (parentWindow) {
      const [width, height] = parentWindow.getSize();
      const [x, y] = parentWindow.getPosition();
      this.window.setSize(width, height);
      this.window.setPosition(x, y);
    }

    this.window.setMenuBarVisibility(false);
    this.window.setAutoHideMenuBar(true);

    this.injectScrollBarCSS();
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
