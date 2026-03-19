# Personal Website Homepage

基于 Vite 的静态个人入口页，作为 DogeOW 的个人网站首页。

## 特性

- 随机背景壁纸
- 根据时间显示问候语（早上好/中午好/下午好/傍晚好/晚上好/夜深了）
- 响应式设计，支持移动端和桌面端

## 技术栈

- Vite 5 - 构建工具
- 原生 JavaScript - 无框架
- CSS3 - 样式

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 目录结构

```plaintext
/
├── public/              # 静态资源
│   ├── favavicon.ico
│   ├── logo192.png
│   ├── logo80.png
│   └── robots.txt
├── src/
│   ├── config.js       # 配置文件
│   ├── main.js         # 入口脚本
│   └── styles.css      # 全局样式
|   └── utils.js        # 工具函数
├── index.html          # HTML 入口
├── package.json
└── README.md
```

## 自定义

### 添加背景图片

编辑 `src/config.js` 中的 `backgroundImages` 数组：

```javascript
const backgroundBaseUrl = "https://your-image-host.com/images";
const backgroundImages = [
  "AIR.jpg",
  "你的名字.jpg",
  // 添加更多图片
];
```

### 修改问候语

编辑 `getGreeting()` 函数可自定义问候语逻辑。
