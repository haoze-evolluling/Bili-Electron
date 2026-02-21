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

webFrame.insertCSS(scrollBarCSS);

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('BiliBili Electron Client Loaded');
});
