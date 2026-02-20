const { app, BrowserWindow, shell, session, ipcMain } = require('electron');
const path = require('path');

// 保持窗口对象的全局引用，防止被垃圾回收
let mainWindow;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 750,
    title: 'Bili-Electron',
    icon: path.join(__dirname, 'logo', 'bilibili_icon_198297.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false,
    backgroundColor: '#ffffff'
  });

  // 加载 B 站主页
  mainWindow.loadURL('https://www.bilibili.com', {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // 页面加载完成后注入 CSS 隐藏滚动条
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.insertCSS(`
      ::-webkit-scrollbar {
        width: 0px !important;
        height: 0px !important;
        display: none !important;
      }
      body {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `);
  });

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发模式下打开开发者工具
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 处理新窗口请求 - 在默认浏览器中打开外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 检查是否是 B 站内部链接
    if (url.startsWith('https://www.bilibili.com') || 
        url.startsWith('https://space.bilibili.com') ||
        url.startsWith('https://t.bilibili.com') ||
        url.startsWith('https://live.bilibili.com') ||
        url.startsWith('https://www.bilibili.com/video') ||
        url.startsWith('https://www.bilibili.com/bangumi')) {
      // 在当前窗口加载 B 站链接
      return { action: 'allow' };
    }
    
    // 外部链接在系统默认浏览器打开
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 处理新窗口创建，使其与原窗口保持相同尺寸和位置
  mainWindow.webContents.on('did-create-window', (newWindow) => {
    const [width, height] = mainWindow.getSize();
    const [x, y] = mainWindow.getPosition();
    newWindow.setSize(width, height);
    newWindow.setPosition(x, y);
  });

  // 拦截导航请求
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // 允许 B 站内部导航
    if (url.startsWith('https://www.bilibili.com') || 
        url.startsWith('https://passport.bilibili.com') ||
        url.startsWith('https://space.bilibili.com') ||
        url.startsWith('https://t.bilibili.com') ||
        url.startsWith('https://live.bilibili.com') ||
        url.startsWith('https://message.bilibili.com') ||
        url.startsWith('https://member.bilibili.com') ||
        url.startsWith('https://pay.bilibili.com')) {
      return;
    }
    
    // 阻止外部导航并在浏览器中打开
    event.preventDefault();
    shell.openExternal(url);
  });

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  // 配置会话，模拟正常浏览器行为
  const filter = {
    urls: ['*://*.bilibili.com/*']
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    // 设置请求头，模拟正常浏览器访问
    details.requestHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    details.requestHeaders['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    callback({ requestHeaders: details.requestHeaders });
  });

  createWindow();

  // macOS 上点击 dock 图标重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（Windows/Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 防止多个应用实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当尝试运行第二个实例时，聚焦到第一个实例的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
