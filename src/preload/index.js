// 预加载脚本，注入自定义样式并暴露安全的API给渲染进程
const { contextBridge, ipcRenderer, webFrame } = require('electron');

const scrollBarCSS = `
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 0px !important;
  }
  ::-webkit-scrollbar-track {
    background: transparent !important;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.4) !important;
    border-radius: 4px !important;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.6) !important;
  }
  ::-webkit-scrollbar-horizontal {
    display: none !important;
  }
  body {
    scrollbar-width: thin !important;
    scrollbar-color: rgba(128, 128, 128, 0.4) transparent !important;
  }
`;

const closeButtonCSS = `
  .electron-control-btn {
    position: fixed !important;
    bottom: 36px !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #fb7299, #fc8bab) !important;
    border: none !important;
    cursor: pointer !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .electron-control-btn:hover {
    transform: scale(1.15) !important;
  }
  .electron-control-btn:active {
    transform: scale(0.85) !important;
  }
  .electron-control-btn svg {
    width: 16px !important;
    height: 16px !important;
    fill: white !important;
  }
  #electron-back-btn {
    right: 56px !important;
  }
  #electron-minimize-btn {
    right: 96px !important;
  }
  #electron-close-btn {
    right: 16px !important;
  }
`;

webFrame.insertCSS(scrollBarCSS);
webFrame.insertCSS(closeButtonCSS);

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});

// 页面历史栈管理
const pageHistory = [];
let currentUrl = location.href;

// 保存当前页面状态
function saveCurrentPageState() {
  const state = {
    url: location.href,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    timestamp: Date.now()
  };
  pageHistory.push(state);
  // 限制历史栈长度，防止内存溢出
  if (pageHistory.length > 10) {
    pageHistory.shift();
  }
}

// 监听页面导航
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  saveCurrentPageState();
  return originalPushState.apply(this, args);
};

history.replaceState = function(...args) {
  saveCurrentPageState();
  return originalReplaceState.apply(this, args);
};

// 监听 popstate 事件（浏览器前进/后退）
window.addEventListener('popstate', () => {
  currentUrl = location.href;
});

// 监听链接点击，保存状态
window.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href && !link.href.startsWith('javascript:') && !link.target) {
    saveCurrentPageState();
  }
}, true);

window.addEventListener('DOMContentLoaded', () => {
  console.log('BiliBili Electron Client Loaded');

  // 返回按钮
  const backBtn = document.createElement('button');
  backBtn.id = 'electron-back-btn';
  backBtn.className = 'electron-control-btn';
  backBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  `;
  backBtn.addEventListener('click', () => {
    if (pageHistory.length > 0) {
      const previousState = pageHistory.pop();
      // 恢复页面状态
      history.back();
      // 等待页面加载完成后恢复滚动位置
      setTimeout(() => {
        window.scrollTo(previousState.scrollX, previousState.scrollY);
      }, 100);
    } else {
      // 如果没有历史记录，使用浏览器默认返回
      history.back();
    }
  });
  document.body.appendChild(backBtn);

  const minimizeBtn = document.createElement('button');
  minimizeBtn.id = 'electron-minimize-btn';
  minimizeBtn.className = 'electron-control-btn';
  minimizeBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M4 11h16v2H4z"/>
    </svg>
  `;
  minimizeBtn.addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
  });
  document.body.appendChild(minimizeBtn);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'electron-close-btn';
  closeBtn.className = 'electron-control-btn';
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  `;
  closeBtn.addEventListener('click', () => {
    ipcRenderer.send('close-window');
  });
  document.body.appendChild(closeBtn);
});
