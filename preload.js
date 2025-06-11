const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的API
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    versions: process.versions,
    isElectron: true
});

// 应用启动时的增强
window.addEventListener('DOMContentLoaded', () => {
    console.log('🖥️ Electron桌面版已启动');
    
    // 添加平台标识
    const platformBadge = document.createElement('div');
    platformBadge.style.cssText = `
        position: fixed; 
        top: 10px; 
        right: 10px; 
        background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%); 
        color: white; 
        padding: 5px 12px; 
        border-radius: 15px; 
        font-size: 12px; 
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        animation: slideIn 0.5s ease-out;
    `;
    
    const platformEmoji = process.platform === 'win32' ? '🪟' : 
                         process.platform === 'darwin' ? '🍎' : '🐧';
    
    platformBadge.innerHTML = `${platformEmoji} 桌面版`;
    document.body.appendChild(platformBadge);
    
    // 添加滑入动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // 5秒后淡出
    setTimeout(() => {
        platformBadge.style.transition = 'opacity 1s ease-out';
        platformBadge.style.opacity = '0';
        setTimeout(() => platformBadge.remove(), 1000);
    }, 5000);
    
    // 增强错误处理
    window.addEventListener('error', (event) => {
        console.error('应用错误:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise错误:', event.reason);
        event.preventDefault();
    });
});
