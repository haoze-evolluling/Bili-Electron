const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 可以在这里添加需要与主进程通信的功能
  
  // 示例：获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 示例：最小化窗口
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  
  // 示例：最大化/还原窗口
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  
  // 示例：关闭窗口
  closeWindow: () => ipcRenderer.send('close-window')
});

// 页面加载完成后执行的脚本
window.addEventListener('DOMContentLoaded', () => {
  // 可以在这里添加对 B 站页面的自定义修改
  // 例如：隐藏某些元素、添加自定义样式等
  
  console.log('BiliBili Electron Client Loaded');
});
