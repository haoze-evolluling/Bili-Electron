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
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .electron-control-btn.visible {
    opacity: 1 !important;
    pointer-events: auto !important;
  }
  .electron-control-btn:hover {
    transform: scale(1.15) !important;
    animation: bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .electron-control-btn:active {
    transform: scale(0.85) !important;
  }
  .electron-control-btn svg {
    width: 16px !important;
    height: 16px !important;
    fill: white !important;
  }
  
  @keyframes bounce {
    0%, 100% { transform: scale(1.15); }
    50% { transform: scale(1.25); }
  }
  
  @keyframes mainBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  #electron-main-btn {
    bottom: 36px !important;
    right: 36px !important;
    width: 52px !important;
    height: 52px !important;
    background: linear-gradient(135deg, #fb7299, #fc8bab) !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4) !important;
  }
  #electron-main-btn:hover {
    animation: mainBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  #electron-main-btn svg {
    width: 24px !important;
    height: 24px !important;
    transition: transform 0.3s ease !important;
  }
  #electron-main-btn.active svg {
    transform: rotate(45deg) !important;
  }
  
  #electron-back-btn {
    bottom: 36px !important;
    right: 36px !important;
  }
  #electron-refresh-btn {
    bottom: 36px !important;
    right: 36px !important;
  }
  #electron-minimize-btn {
    bottom: 36px !important;
    right: 36px !important;
  }
  #electron-close-btn {
    bottom: 36px !important;
    right: 36px !important;
  }
  
  #electron-back-btn.expanded {
    transform: translate(0px, -80px) !important;
  }
  #electron-back-btn.expanded:hover {
    transform: translate(0px, -80px) scale(1.15) !important;
  }
  #electron-back-btn.expanded:active {
    transform: translate(0px, -80px) scale(0.85) !important;
  }
  #electron-refresh-btn.expanded {
    transform: translate(-40px, -69.28px) !important;
  }
  #electron-refresh-btn.expanded:hover {
    transform: translate(-40px, -69.28px) scale(1.15) !important;
  }
  #electron-refresh-btn.expanded:active {
    transform: translate(-40px, -69.28px) scale(0.85) !important;
  }
  #electron-minimize-btn.expanded {
    transform: translate(-69.28px, -40px) !important;
  }
  #electron-minimize-btn.expanded:hover {
    transform: translate(-69.28px, -40px) scale(1.15) !important;
  }
  #electron-minimize-btn.expanded:active {
    transform: translate(-69.28px, -40px) scale(0.85) !important;
  }
  #electron-close-btn.expanded {
    transform: translate(-80px, 0px) !important;
  }
  #electron-close-btn.expanded:hover {
    transform: translate(-80px, 0px) scale(1.15) !important;
  }
  #electron-close-btn.expanded:active {
    transform: translate(-80px, 0px) scale(0.85) !important;
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

  let isExpanded = false;

  // 主按钮
  const mainBtn = document.createElement('button');
  mainBtn.id = 'electron-main-btn';
  mainBtn.className = 'electron-control-btn';
  mainBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  `;
  mainBtn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    mainBtn.classList.toggle('active', isExpanded);
    backBtn.classList.toggle('visible', isExpanded);
    refreshBtn.classList.toggle('visible', isExpanded);
    minimizeBtn.classList.toggle('visible', isExpanded);
    closeBtn.classList.toggle('visible', isExpanded);
    backBtn.classList.toggle('expanded', isExpanded);
    refreshBtn.classList.toggle('expanded', isExpanded);
    minimizeBtn.classList.toggle('expanded', isExpanded);
    closeBtn.classList.toggle('expanded', isExpanded);
  });
  document.body.appendChild(mainBtn);

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
    history.back();
  });
  document.body.appendChild(backBtn);

  // 刷新按钮
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'electron-refresh-btn';
  refreshBtn.className = 'electron-control-btn';
  refreshBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
  `;
  refreshBtn.addEventListener('click', () => {
    location.reload();
  });
  document.body.appendChild(refreshBtn);

  // 最小化按钮
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

  // 关闭按钮
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
