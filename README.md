# 富瑞财富 Triton Wealth Management — 官网

加拿大温哥华华人理财顾问机构 **富瑞财富** 的官方网站。
纯静态站点，零构建依赖，可直接部署到任何静态文件服务器（NAS / Nginx / Apache / Vercel / Netlify 等）。

---

## 文件结构

```
TRITON WEBSITE/
├── index.html          首页（Hero · 公司介绍 · 8大服务 · CTA）
├── about.html          关于我们（创始团队 · 理念）
├── services.html       服务范围（8大服务详细说明）
├── partners.html       合作伙伴（保险公司 · 银行 logo）
├── workshops.html      富瑞讲堂（过往讲座精选）
├── contact.html        联系我们（地址 · 电话 · 地图 · FAQ）
├── assets/
│   ├── css/style.css   全站样式（CSS 变量色板 / 响应式）
│   ├── js/main.js      交互脚本（菜单 / 动画 / 计数 / 视差）
│   └── images/         图片素材（待补充）
└── README.md
```

---

## 本地预览

任选其一：

```bash
# Python 3
cd "/path/to/TRITON WEBSITE"
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000

# 或 Node
npx serve .
```

> 直接双击 `index.html` 也能看到大致效果，但部分功能（字体加载、地图 iframe）需要 HTTP 协议才正常。

---

## 群晖 NAS 部署（Web Station）

### 方式 A：作为虚拟主机（推荐，可绑定独立域名）

1. **套件中心** → 安装 **Web Station**
2. 把整个 `TRITON WEBSITE` 文件夹拷贝到 NAS 的 `web` 共享文件夹下
   例如：`/volume1/web/triton`
3. **Web Station** → **Web 服务门户** → **新增**
   - 服务门户类型：**基于名称的**
   - 主机名：`www.tritonwealth.ca`（或你的内网/外网域名）
   - HTTP 端口：80（HTTPS 443）
   - 文档根目录：`web/triton`
   - 后端服务器：默认 Nginx 即可（无需 PHP）
4. 在路由器/DNS 上把域名指向 NAS 公网 IP
5. 在 **控制面板 → 安全性 → 证书** 配置 Let's Encrypt 免费 HTTPS

### 方式 B：直接放进默认 `web` 目录（最简）

1. 把整站文件夹改名为 `triton`，拷贝到 `/volume1/web/`
2. 浏览器访问 `http://nas-ip/triton/` 即可

### 方式 C：用 Docker 跑 Nginx（最干净）

```bash
docker run -d \
  --name triton-web \
  -p 8080:80 \
  -v "/volume1/web/triton":/usr/share/nginx/html:ro \
  --restart unless-stopped \
  nginx:alpine
```

访问 `http://nas-ip:8080`

---

## 部署到普通主机 / Nginx

```nginx
server {
    listen 80;
    server_name www.tritonwealth.ca tritonwealth.ca;
    root /var/www/triton;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 后续可补充的素材

以下内容目前为占位/默认，建议陆续替换：

| 项目 | 当前 | 建议 |
|---|---|---|
| 顾问头像 | 用首字母圆形占位（JY / CQ） | 上传真人专业头像，放到 `assets/images/` 并替换 about.html 中的 `.founder-avatar` |
| 公司 Logo | 仅文字 logo | 设计一个 SVG/PNG logo 替换 header/footer 的文字 logo |
| 合作伙伴 Logo | 文字名称 | 替换为真实保险公司/银行的官方 logo（注意品牌使用许可） |
| 讲座海报 | 渐变色块 + 标签 | 替换为真实讲座海报/照片 |
| Email 地址 | 默认 `info@tritonwealth.ca` | 全站搜索替换为实际使用邮箱 |
| 备案/版权 | "© 2026" | 按需调整 |
| Privacy / Legal / Terms 链接 | 当前 `#` 空链接 | 链接到 PDF 或单独的政策页 |
| Favicon | 无 | 添加 `favicon.ico` 到根目录 |
| OG / Twitter 卡片图 | 无 | 添加 1200×630 分享图，head 加 `<meta property="og:image">` |

---

## 设计规范速查

- **主色（深）**：`#0B1E3F` 深海蓝 / `#0E1117` 近黑
- **金色**：`#C9A961` 哑光金 / `#D9BE7E` 浅金
- **背景米色**：`#F5F2EB` / `#ECE7DA`
- **正文**：`#1B2230` / `#4A5365`
- **字体**：
  - 中文：Noto Serif SC（标题） + Noto Sans SC（正文）
  - 英文：Cormorant Garamond（斜体标题） + Inter（无衬线正文）

所有色值与字体均在 `assets/css/style.css` 顶部的 `:root` 变量中定义，统一调整即可全站生效。

---

## 浏览器兼容

- Chrome / Edge / Safari / Firefox **最新两个大版本**
- iOS Safari 14+ / Chrome Android
- 已通过 `prefers-reduced-motion` 处理动画无障碍

---

© Triton Wealth Management Corporation 富瑞财富
