const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const url = require('url');

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
            nodeIntegration: true,        // ← 改为true
            contextIsolation: false,      // ← 改为false  
            enableRemoteModule: true,     // ← 改为true
            webSecurity: false,           // ← 禁用web安全
            allowRunningInsecureContent: true,  // ← 允许不安全内容
            experimentalFeatures: true    // ← 启用实验性功能
        },
        titleBarStyle: 'default',
        show: false,
        title: '婴幼儿健康追踪系统'
    });

    // 使用URL加载而不是loadFile
    const htmlPath = path.join(__dirname, 'src', 'baby.html');
    const htmlUrl = url.format({
        pathname: htmlPath,
        protocol: 'file:',
        slashes: true
    });
    
    console.log('加载HTML URL:', htmlUrl);
    mainWindow.loadURL(htmlUrl);

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 显示欢迎信息
        setTimeout(() => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '应用启动成功',
                message: '婴幼儿健康追踪系统',
                detail: '🍼 应用已成功启动！\n📊 可以开始使用了',
                buttons: ['开始使用'],
                noLink: true
            });
        }, 1000);
    });

    // 页面加载完成事件
    mainWindow.webContents.once('dom-ready', () => {
        console.log('DOM加载完成');
    });

    // 错误处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('页面加载失败:', errorCode, errorDescription);
    });

    // 窗口关闭时的处理
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 创建简化菜单
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '刷新',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: '开发者工具',
                    accelerator: 'CmdOrCtrl+Option+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于',
                            message: '婴幼儿健康追踪系统 v1.0.0',
                            detail: '基于WHO 2006标准的智能生长发育监测工具',
                            buttons: ['确定'],
                            noLink: true
                        });
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

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
