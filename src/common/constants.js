// 应用常量配置
const CONSTANTS = {
  APP_NAME: 'Bili-Electron',
  
  WINDOW: {
    DEFAULT_WIDTH: 1300,
    DEFAULT_HEIGHT: 800,
    MIN_WIDTH: 1300,
    MIN_HEIGHT: 800,
    BACKGROUND_COLOR: '#ffffff'
  },
  
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  
  URLS: {
    BILIBILI_HOME: 'https://www.bilibili.com',
    BILIBILI_DOMAIN: 'bilibili.com'
  },
  
  HEADERS: {
    ACCEPT_LANGUAGE: 'zh-CN,zh;q=0.9,en;q=0.8',
    ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  }
};

module.exports = CONSTANTS;
