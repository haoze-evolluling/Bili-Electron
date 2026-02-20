# BiliBili Electron 客户端

基于 Electron 封装的 B 站桌面客户端，直接加载 B 站网页版。

## 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: Windows 10/11、macOS、Linux

## 快速开始

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd Bili-Electron
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动应用

```bash
# 生产模式启动
npm start

# 开发模式启动（自动打开开发者工具）
npm run dev
```

## 打包编译

### Windows 可执行文件 (.exe)

```bash
# 打包 Windows 版本（默认 NSIS 安装包）
npm run build:win

# 或使用通用打包命令
npm run build
```

打包完成后，安装包位于 `dist/` 目录下：
- `BiliBili Setup x.x.x.exe` - Windows 安装程序

### macOS 应用程序 (.app / .dmg)

```bash
npm run build:mac
```

输出文件：
- `BiliBili-x.x.x.dmg` - macOS 安装镜像
- `BiliBili-x.x.x-mac.zip` - 便携版压缩包

### Linux 应用程序 (AppImage)

```bash
npm run build:linux
```

输出文件：
- `BiliBili-x.x.x.AppImage` - Linux 可执行文件

## 项目结构

```
Bili-Electron/
├── main.js           # Electron 主进程
├── preload.js        # 预加载脚本
├── package.json      # 项目配置
├── .gitignore        # Git 忽略规则
└── dist/             # 打包输出目录（自动生成）
```

## 常见问题

### 安装依赖失败

如果 `npm install` 速度慢或失败，可以尝试使用国内镜像：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 打包失败

1. 确保已安装所有依赖：`npm install`
2. 检查 Node.js 版本是否符合要求
3. Windows 打包需要在 Windows 环境下进行

### 应用无法启动

1. 检查是否有其他程序占用端口
2. 删除 `node_modules` 重新安装依赖
3. 查看控制台错误信息

## 开发说明

### 调试

开发模式下按 `F12` 或 `Ctrl+Shift+I` 打开开发者工具。

### 修改窗口配置

编辑 `main.js` 中的 `BrowserWindow` 配置项：

```javascript
mainWindow = new BrowserWindow({
  width: 1600,      // 窗口宽度
  height: 900,      // 窗口高度
  // ... 其他配置
});
```

## 许可证

MIT License
