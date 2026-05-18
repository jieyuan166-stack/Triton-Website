# Cloudflare Redirect Rules — 手动配置指南

> 如果找不到 Bulk Redirects，用域名级别的 Redirect Rules 也能完成。
> 免费版限额 10 条，我们用 7 条搞定 12 个旧 URL。

## 入口

1. Cloudflare Dashboard → 选 `tritonwealth.ca`
2. 左侧 **Rules** → **Redirect Rules**
3. 点 **Create rule**

---

## 7 条规则（按顺序创建）

### Rule 1: `/about.html` → `/about/`

| 字段 | 值 |
|---|---|
| **Rule name** | `Redirect /about.html` |
| **When incoming requests match** | Custom filter expression |
| **Field** | URI Path |
| **Operator** | equals |
| **Value** | `/about.html` |
| **Then... Type** | Static |
| **URL** | `https://www.tritonwealth.ca/about/` |
| **Status code** | 301 |
| **Preserve query string** | ✓ |

---

### Rule 2: `/services.html` → `/services/`

同上，把 `about` 全部替换成 `services`。

---

### Rule 3: `/contact.html` → `/contact/`

同上，把 `about` 全部替换成 `contact`。

---

### Rule 4: `/workshops.html` → `/workshops/`

同上。

---

### Rule 5: Partners (3 个旧路径合并)

| 字段 | 值 |
|---|---|
| **Rule name** | `Redirect partners (old paths)` |
| **Custom filter expression**（点 "Edit expression"，粘下面这段）| `(http.request.uri.path eq "/partners.html") or (http.request.uri.path eq "/parners") or (http.request.uri.path eq "/parners.html")` |
| **URL** | `https://www.tritonwealth.ca/partners/` |
| **Status code** | 301 |
| **Preserve query string** | ✓ |

> 这条同时处理：`/partners.html` 和 Wix 时代拼错的 `/parners` `/parners.html`

---

### Rule 6: Legal pages (2 个旧路径合并)

| 字段 | 值 |
|---|---|
| **Rule name** | `Redirect legal/terms (old paths)` |
| **Custom filter expression** | `(http.request.uri.path eq "/legal-disclaimers.html") or (http.request.uri.path eq "/copy-of-privary-policy")` |
| **URL** | `https://www.tritonwealth.ca/legal-disclaimers/` |
| **Status code** | 301 |

---

### Rule 7: Terms (2 个旧路径合并)

| 字段 | 值 |
|---|---|
| **Rule name** | `Redirect terms (old paths)` |
| **Custom filter expression** | `(http.request.uri.path eq "/terms.html") or (http.request.uri.path eq "/copy-of-legal-disclaimers")` |
| **URL** | `https://www.tritonwealth.ca/terms/` |
| **Status code** | 301 |

---

## 跳过 `/index.html` 的原因

`/index.html` 在大多数 web 服务器上会被自动 rewrite 到 `/`，所以一般不需要单独写。但如果你看到 `curl -I /index.html` 还返回 200 而不是 301，加一条：

| Field | Operator | Value |
|---|---|---|
| URI Path | equals | `/index.html` |
| → | → | `/` (301) |

---

## 部署完毕后

1. 等 1-2 分钟全球边缘节点同步
2. 在本地跑验证脚本：
   ```bash
   cd "/Users/jeffreymacmini/TRITON WEBSITE"
   ./scripts/verify-redirects.sh
   ```
3. 看到 "All redirects working! Safe to delete flat .html files." → 按 Y 删除
