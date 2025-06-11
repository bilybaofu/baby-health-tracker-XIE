# 🍼 婴幼儿健康追踪系统

基于WHO 2006标准的智能生长发育监测工具（桌面版）

## ✨ 功能特色

- 🤖 **智能OCR识别** - 支持体检报告自动识别和数据提取
- 📊 **WHO标准计算** - 精确的百分位数计算，支持0-36个月
- 📈 **生长曲线图** - 可视化展示宝宝成长轨迹
- 🍼 **AI喂养指导** - 个性化营养建议和喂养方案
- 💾 **本地存储** - 数据完全本地保存，保护隐私安全
- 🖥️ **离线使用** - 无需网络连接，随时随地使用

## 📥 下载安装

### 最新版本下载

[![GitHub release](https://img.shields.io/github/v/release/你的用户名/baby-health-tracker)](https://github.com/你的用户名/baby-health-tracker/releases/latest)

前往 [Releases 页面](https://github.com/你的用户名/baby-health-tracker/releases) 下载最新版本：

- **Windows**: 下载 `.exe` 安装程序
- **macOS**: 下载 `.dmg` 安装包

### 系统要求

- **Windows**: Windows 7 SP1 或更高版本
- **macOS**: macOS 10.13 或更高版本

## 🚀 快速开始

1. **下载安装包** - 从Releases页面下载对应系统的安装包
2. **安装应用** - 双击安装包按提示安装
3. **填写基本信息** - 首次使用需填写宝宝姓名、性别、出生日期
4. **添加体检记录** - 可上传体检报告或手动输入数据
5. **查看分析结果** - 自动计算百分位数和生长趋势

## 📱 界面预览

![应用截图](screenshot.png)

## 🛠️ 开发构建

如需自己构建应用：

```bash
# 克隆仓库
git clone https://github.com/你的用户名/baby-health-tracker.git
cd baby-health-tracker

# 安装依赖
npm install

# 开发模式运行
npm start

# 构建应用
npm run dist
