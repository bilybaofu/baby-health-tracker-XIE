const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');

// 禁用安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'default',
        show: false,
        title: '婴幼儿健康追踪系统'
    });

    // 加载应用
    mainWindow.loadFile('src/baby.html');

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 显示欢迎信息
        setTimeout(() => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '欢迎使用',
                message: '婴幼儿健康追踪系统',
                detail: '🍼 基于WHO 2006标准的智能生长发育监测工具\n📊 所有数据本地存储，保护隐私安全\n🤖 支持OCR智能识别和AI营养指导\n\n✨ 这是离线桌面版，无需网络连接！',
                buttons: ['开始使用'],
                noLink: true
            });
        }, 1000);
    });

    // 窗口关闭时的处理
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 阻止外部链接在应用内打开
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // 开发时开启开发者工具（可选）
    // mainWindow.webContents.openDevTools();
}

// 创建菜单
function createMenu() {
    const isMac = process.platform === 'darwin';
    
    const template = [
        ...(isMac ? [{
            label: app.getName(),
            submenu: [
                { role: 'about', label: '关于' },
                { type: 'separator' },
                { role: 'services', label: '服务' },
                { type: 'separator' },
                { role: 'hide', label: '隐藏' },
                { role: 'hideothers', label: '隐藏其他' },
                { role: 'unhide', label: '显示全部' },
                { type: 'separator' },
                { role: 'quit', label: '退出' }
            ]
        }] : []),
        {
            label: '文件',
            submenu: [
                {
                    label: '导出数据...',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('window.babyTracker?.exportData()');
                    }
                },
                {
                    label: '导入数据...',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('window.babyTracker?.importData()');
                    }
                },
                { type: 'separator' },
                ...(!isMac ? [
                    {
                        label: '退出',
                        accelerator: 'Ctrl+Q',
                        click: () => app.quit()
                    }
                ] : [])
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' },
                { role: 'selectall', label: '全选' }
            ]
        },
        {
            label: '查看',
            submenu: [
                { role: 'reload', label: '刷新' },
                { role: 'forceReload', label: '强制刷新' },
                { role: 'toggleDevTools', label: '开发者工具' },
                { type: 'separator' },
                { role: 'resetZoom', label: '实际大小' },
                { role: 'zoomIn', label: '放大' },
                { role: 'zoomOut', label: '缩小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全屏' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { role: 'minimize', label: '最小化' },
                { role: 'close', label: '关闭' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front', label: '前置全部窗口' }
                ] : [])
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于应用',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于',
                            message: '婴幼儿健康追踪系统',
                            detail: `版本：1.0.0
基于WHO 2006标准
支持OCR识别和AI分析

🍼 功能特色：
• 智能体检报告识别
• WHO标准百分位计算  
• 生长曲线可视化
• AI个性化喂养指导
• 数据本地安全存储

💻 技术支持：
Electron ${process.versions.electron}
Chrome ${process.versions.chrome}
Node.js ${process.versions.node}`,
                            buttons: ['确定'],
                            noLink: true
                        });
                    }
                },
                {
                    label: 'GitHub仓库',
                    click: () => {
                        shell.openExternal('https://github.com/你的用户名/baby-health-tracker');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 应用准备就绪
app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 所有窗口关闭时退出应用（Mac除外）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 阻止导航到外部链接
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (navigationEvent, navigationURL) => {
        navigationEvent.preventDefault();
        shell.openExternal(navigationURL);
    });
});
