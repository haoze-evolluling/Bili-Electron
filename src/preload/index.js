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
    bottom: 24px !important;
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #fb7299, #fc8bab) !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(251, 114, 153, 0.4) !important;
    cursor: pointer !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s ease !important;
  }
  .electron-control-btn:hover {
    transform: scale(1.1) !important;
    box-shadow: 0 6px 20px rgba(251, 114, 153, 0.6) !important;
  }
  .electron-control-btn:active {
    transform: scale(0.95) !important;
  }
  .electron-control-btn svg {
    width: 24px !important;
    height: 24px !important;
    fill: white !important;
  }
  #electron-refresh-btn {
    right: 80px !important;
  }
  #electron-minimize-btn {
    right: 136px !important;
  }
  #electron-close-btn {
    right: 24px !important;
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

window.addEventListener('DOMContentLoaded', () => {
  console.log('BiliBili Electron Client Loaded');

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
