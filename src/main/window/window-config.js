// 窗口配置管理，定义窗口选项
const path = require('path');
const CONSTANTS = require('../../common/constants');

const WindowConfig = {
  mainWindowOptions: {
    width: CONSTANTS.WINDOW.DEFAULT_WIDTH,
    height: CONSTANTS.WINDOW.DEFAULT_HEIGHT,
    title: CONSTANTS.APP_NAME,
    icon: path.join(__dirname, '..', '..', '..', 'logo', 'bilibili_icon_198297.png'),
    autoHideMenuBar: true,
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

  isInternalUrl(url) {
    return url.includes(CONSTANTS.URLS.BILIBILI_DOMAIN);
  }
};

module.exports = WindowConfig;
