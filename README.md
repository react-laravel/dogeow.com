# Personal Website Homepage

基于 Vite 的静态个人网站入口页。

## 特性

- 响应式设计，支持移动端和桌面端
- 根据时间显示问候语（早上好/上午好/中午好/下午好/傍晚好/晚上好/夜深了）
- 随机背景壁纸

## 技术栈

- Vite 8 - 构建工具
- 原生 JavaScript - 无框架

## 开发

```bash
# 安装依赖
npm ci

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

## 部署

站点采用发布目录模式部署，Web 根目录应始终指向 `$APP_ROOT/current/dist`。

### 首次部署

首次部署默认是手动流程：先把仓库 clone 到服务器目标目录，再运行 `scripts/first-deploy.sh` 创建首个 release 并切换 `current`。

```bash
git clone https://github.com/react-laravel/dogeow.com.git /var/www/dogeow.com
cd /var/www/dogeow.com/scripts
./first-deploy.sh
```

可选环境变量：

- `APP_ROOT`：站点根目录；如果脚本就在仓库的 `scripts` 目录里执行，可省略
- `SHARED_CONFIG_DIR`：共享配置目录，默认是 `$APP_ROOT.shared`

### 后续更新部署

首次部署完成后，GitHub self-hosted runner 会在 `APP_ROOT` 这个 Git 工作树内执行更新部署，调用 `scripts/deploy-zero-downtime.sh` 构建新的 release，并原子切换 `current`。

### 共享配置目录

本地配置文件建议放在 `$APP_ROOT.shared`，例如：

- `$APP_ROOT.shared/.env`
- `$APP_ROOT.shared/.env.production`

部署脚本会优先从共享配置目录复制这些文件到每个 release。若历史上曾把未跟踪的 `.env*` 放在 `APP_ROOT` 根目录，更新部署时会自动迁移到共享配置目录，避免后续 `git pull` 与工作树发生冲突。

## 目录结构

```plaintext
/
├── public/              # 静态资源
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo80.png
│   └── robots.txt
├── src/
│   ├── config.js       # 配置文件
│   ├── main.js         # 入口脚本
│   ├── styles.css      # 全局样式
│   └── utils.js        # 工具函数
├── tests/              # 自动化测试
├── index.html          # HTML 入口
├── package.json
├── scripts/
│   ├── deploy-zero-downtime.sh
│   └── first-deploy.sh
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
