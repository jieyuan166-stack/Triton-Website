# SEO 上线后操作清单（按顺序做）

## A. Cloudflare 一次性配置（10 分钟）

### 1. 导入批量 301 重定向

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选 `tritonwealth.ca` 域名
3. 左侧菜单 → **Rules** → **Redirect Rules**（或 **Bulk Redirects**）
4. 点 **Create Bulk Redirect List**
   - List name: `triton-legacy-urls`
   - Description: `Redirect old Wix/flat URLs to new pretty URLs`
5. 选 **Upload CSV**，上传 [docs/cloudflare-redirects.csv](cloudflare-redirects.csv)（项目根目录里就有）
6. 创建一个 **Bulk Redirect Rule**：
   - Name: `Triton legacy URL migration`
   - 关联到刚才那个 list
   - 部署

> 部署后 1-2 分钟生效。验证命令：
> ```bash
> curl -sI https://www.tritonwealth.ca/about.html | head -3
> # 应该看到: HTTP/2 301
> # location: https://www.tritonwealth.ca/about/
> ```

### 2. （可选）开启自动 HTTPS 重写 + HSTS
- **SSL/TLS** → **Edge Certificates** → 打开 **Always Use HTTPS** + **HSTS** (max-age 6 months)

### 3. （可选）页面缓存优化
- **Caching** → **Configuration** → 设置 Browser Cache TTL：4 hours
- 部署后 Search Console 报告的 "Core Web Vitals" 分数会上来

---

## B. Search Console 触发新一轮抓取（5 分钟）

旧 sitemap 删不掉就不删了，但要让 Google 立刻读新的：

### 1. 重新提交 sitemap.xml（强制 Google 重抓）
1. 进 [Sitemaps 页面](https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.tritonwealth.ca%2F)
2. 在 "Add a new sitemap" 输入框里输入：`sitemap.xml`
3. 点 **SUBMIT**（即使已存在，重提会触发重新抓取）
4. 24 小时后回来看，**Discovered URLs 应该从 0 变成 8**

### 2. URL Inspection 主动请求索引
左侧菜单 → **URL Inspection** → 粘下面这 6 个，每个粘进去后点 "Request Indexing"：

```
https://www.tritonwealth.ca/
https://www.tritonwealth.ca/about/
https://www.tritonwealth.ca/services/
https://www.tritonwealth.ca/partners/
https://www.tritonwealth.ca/workshops/
https://www.tritonwealth.ca/contact/
```

> 每个 URL 大约会在 Google 队列里排 1-3 天处理。
> Search Console 每天有配额限制（约 10 次），分两天做完即可。

### 3. 验证结构化数据
进 [Rich Results Test](https://search.google.com/test/rich-results) 测这 4 个 URL：

| URL | 应该看到的 schema |
|---|---|
| `https://www.tritonwealth.ca/` | **FinancialService** |
| `https://www.tritonwealth.ca/services/` | **ItemList** + **BreadcrumbList** |
| `https://www.tritonwealth.ca/about/` | **Person** × 2 + **BreadcrumbList** |
| `https://www.tritonwealth.ca/contact/` | **FAQPage** + **BreadcrumbList** |

> 如果看到 ✅ 全绿就好了。Google 1-4 周后会开始在搜索结果里展示富媒体效果。

---

## C. Bing Webmaster Tools（5 分钟，一次性）

[https://www.bing.com/webmasters](https://www.bing.com/webmasters)

1. 用 Google 账号登录（Bing 支持导入 Google Search Console 资源 → 一键完成验证 + 提交 sitemap）
2. 找到 "Import from GSC" 按钮
3. 选择 `tritonwealth.ca` → 一键导入完毕

> 这一步多覆盖 ~5% 加拿大 Bing 用户的搜索流量。

---

## D. Google Business Profile（关键，按 [google-business-profile-guide.md](google-business-profile-guide.md) 完整做）

**今天就开始**，因为明信片验证要 5-14 天。这是本地搜索流量最大的杠杆。

---

## E. 一周后回来看

| 检查项 | 在哪看 | 期待值 |
|---|---|---|
| Sitemap status | Search Console → Sitemaps | `/sitemap.xml` Discovered URLs = 8 |
| Indexed pages | Search Console → Pages | 至少首页 + 3-4 个内页被 "Indexed" |
| Impressions | Search Console → Performance | 开始出现搜索曝光数据 |
| 旧 URL 301 工作 | `curl -sI https://www.tritonwealth.ca/about.html` | 返回 `301` + `location: /about/` |
| GBP 验证进度 | Google Business Profile manager | 等明信片到（如选了明信片验证）|

---

## F. 一个月后

| 优化方向 | 触发条件 |
|---|---|
| 加博客文章 | Performance 报告里搜索词太少（< 50 unique queries / month） |
| 增加 sameAs 链接 | 收集到 LinkedIn / 小红书 / 微信公众号链接 |
| 收集 Google Reviews | GBP 上线 2 周后向 5 位老客户发邀请 |
| 优化点击率 | CTR < 2% 的页面调整 title / description |
