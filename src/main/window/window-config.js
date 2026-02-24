const path = require('path');
const CONSTANTS = require('../../common/constants');

module.exports = {
  mainWindowOptions: {
    width: CONSTANTS.WINDOW.DEFAULT_WIDTH,
    height: CONSTANTS.WINDOW.DEFAULT_HEIGHT,
    title: CONSTANTS.APP_NAME,
    icon: path.join(__dirname, '..', '..', '..', 'logo', 'bilibili_icon_198297.png'),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', '..', 'preload', 'index.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false,
    backgroundColor: CONSTANTS.WINDOW.BACKGROUND_COLOR
  },

  userAgent: CONSTANTS.USER_AGENT,

  isInternalUrl: (url) => url.includes(CONSTANTS.URLS.BILIBILI_DOMAIN)
};
