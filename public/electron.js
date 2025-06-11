const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const isDev = process.argv.includes('--dev');

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // 允许本地文件访问，用于图片上传
    },
    titleBarStyle: 'default',
    show: false,
    center: true
  });

  // 加载应用页面
  const startUrl = path.join(__dirname, '../src/index.html');
  mainWindow.loadFile(startUrl);

  // 开发模式下打开DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 设置窗口标题
    mainWindow.setTitle('婴幼儿健康追踪系统 v1.0.0');
  });

  // 防止新窗口打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 创建菜单
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '导出数据',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            exportData();
          }
        },
        {
          label: '导入数据',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            importData();
          }
        },
        { type: 'separator' },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.babyTracker) {
                document.querySelector('button[onclick="showSettings()"]').click();
              }
            `);
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
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '使用说明',
          click: () => {
            shell.openExternal('https://github.com/你的用户名/baby-health-tracker-desktop#readme');
          }
        },
        {
          label: '反馈问题',
          click: () => {
            shell.openExternal('https://github.com/你的用户名/baby-health-tracker-desktop/issues');
          }
        },
        { type: 'separator' },
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于婴幼儿健康追踪系统',
              message: '婴幼儿健康追踪系统',
              detail: `版本: 1.0.0
基于WHO 2006标准的智能生长发育监测工具

功能特点:
• 精确的百分位计算
• 体检报告OCR识别
• 生长曲线可视化
• 本地数据存储
• 个性化喂养指导

开发: Electron + JavaScript
许可: MIT License`,
              buttons: ['确定'],
              defaultId: 0
            });
          }
        }
      ]
    }
  ];

  // macOS平台菜单调整
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: '关于 ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: '服务', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: '隐藏 ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: '隐藏其他', accelerator: 'Command+Shift+H', role: 'hideothers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        { label: '退出', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC处理函数
async function exportData() {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出数据',
      defaultPath: `baby-health-data-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          if (window.babyTracker) {
            const data = {
              babyInfo: window.babyTracker.babyInfo,
              checkRecords: window.babyTracker.checkRecords,
              exportTime: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
          }
          return null;
        })()
      `).then(data => {
        if (data) {
          fs.writeFileSync(result.filePath, data, 'utf8');
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '导出成功',
            message: '数据已成功导出到文件',
            detail: result.filePath
          });
        }
      }).catch(err => {
        dialog.showErrorBox('导出失败', '导出数据时发生错误: ' + err.message);
      });
    }
  } catch (error) {
    dialog.showErrorBox('导出失败', '导出数据时发生错误: ' + error.message);
  }
}

async function importData() {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '导入数据',
      properties: ['openFile'],
      filters: [
        { name: 'JSON文件', extensions: ['json'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const data = fs.readFileSync(filePath, 'utf8');
      
      try {
        const importData = JSON.parse(data);
        
        // 验证数据格式
        if (importData.babyInfo || importData.checkRecords) {
          mainWindow.webContents.executeJavaScript(`
            (function() {
              if (window.babyTracker) {
                const importData = ${data};
                if (importData.babyInfo) {
                  window.babyTracker.babyInfo = importData.babyInfo;
                  localStorage.setItem('baby_info', JSON.stringify(importData.babyInfo));
                }
                if (importData.checkRecords) {
                  window.babyTracker.checkRecords = importData.checkRecords;
                  localStorage.setItem('baby_check_records', JSON.stringify(importData.checkRecords));
                }
                // 刷新界面
                window.babyTracker.loadBabyInfo();
                window.babyTracker.loadCheckRecords();
                return true;
              }
              return false;
            })()
          `).then(success => {
            if (success) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '导入成功',
                message: '数据已成功导入',
                detail: '页面将自动刷新以显示导入的数据'
              });
            } else {
              throw new Error('无法访问应用实例');
            }
          });
        } else {
          throw new Error('文件格式不正确');
        }
      } catch (parseError) {
        dialog.showErrorBox('导入失败', '文件格式不正确或数据损坏');
      }
    }
  } catch (error) {
    dialog.showErrorBox('导入失败', '导入数据时发生错误: ' + error.message);
  }
}

// 应用事件处理
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 阻止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
