const path = require('path');

const WindowConfig = {
  mainWindowOptions: {
    width: 1300,
    height: 750,
    title: 'Bili-Electron',
    icon: path.join(__dirname, '..', '..', 'logo', 'bilibili_icon_198297.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', '..', 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false,
    backgroundColor: '#ffffff'
  },

  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  scrollBarCSS: `
    ::-webkit-scrollbar {
      width: 0px !important;
      height: 0px !important;
      display: none !important;
    }
    body {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
  `,

  isInternalUrl(url) {
    return url.includes('bilibili');
  }
};

module.exports = WindowConfig;
