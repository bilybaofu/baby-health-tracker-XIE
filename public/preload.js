const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  platform: process.platform,
  isElectron: true,
  
  // 文件操作
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // 应用控制
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  
  // 通知
  showNotification: (title, body) => {
    new Notification(title, { body });
  }
});

// 增强本地存储功能
window.addEventListener('DOMContentLoaded', () => {
  // 为桌面版本添加特殊标识
  document.body.classList.add('electron-app');
  
  // 添加桌面版本样式
  const style = document.createElement('style');
  style.textContent = `
    .electron-app {
      user-select: none;
    }
    .electron-app input, .electron-app textarea {
      user-select: text;
    }
    .electron-app .header {
      -webkit-app-region: drag;
    }
    .electron-app .header button, .electron-app .header input {
      -webkit-app-region: no-drag;
    }
  `;
  document.head.appendChild(style);
});
