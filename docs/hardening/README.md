# 网站加固指南 — 让 tritonwealth.ca 不再掉线

> **现状理解**（很重要）：
>
> 1. **www.tritonwealth.ca（营销网站）** = Cloudflare Pages，从 GitHub 自动部署
>    → **极稳定**，NAS 关机不影响营销网站访问
> 2. **crm.tritonwealth.ca（CRM 系统）** = Cloudflare Tunnel → NAS docker
>    → **脆弱**，依赖 NAS 在线 + tunnel 健康 + 网络稳定
>
> 之前"网站掉线"的真正原因：
> - **DNS 记录被手动改坏**（人为）→ 已通过加 root→www 重定向缓解
> - **CRM tunnel 偶发掉线**（Error 1033）→ 这次加固重点解决
> - **www 看似掉线** → 其实多数是路由器 DNS 缓存导致**只有你**看不到

---

## 加固清单（按 ROI 排序）

| # | 项目 | 你的工作量 | 解决了什么 |
|---|---|---|---|
| 1 | Cloudflare Always Online | 2 分钟，1 个开关 | 即使源站全挂，CF 也用缓存照常服务 |
| 2 | Cloudflare Notifications | 5 分钟 | tunnel 一掉线立刻收邮件 |
| 3 | UptimeRobot 外部监控 | 10 分钟 | 全球 8 个节点每 5 分钟扫一次，独立第三方 |
| 4 | 修 watchdog + 加 cloudflared healthcheck | 我帮你写好了，你部署 | 修复误报、自动重启异常 tunnel |
| 5 | DNS 自动备份 | 5 分钟一次性配置 | 不怕误删，30 天回滚窗口 |

---

## 1. Cloudflare Always Online（**最重要 — 先做这个**）

**作用**：当你的 origin（NAS / tunnel / 任何后端）完全挂掉时，Cloudflare 会从它**自己的缓存**里把网站最后一次抓取的版本继续提供给访客。客户**不会看到任何错误页**，体验和正常没区别。

### 设置（2 分钟）

1. [dash.cloudflare.com](https://dash.cloudflare.com) → 选 `tritonwealth.ca`
2. 左侧菜单 → **Caching** → **Configuration**
3. 滚到 **Always Online™** → **打开开关**

> ⚠️ 注意：这只对营销网站完全有效（它是公开页面，CF 能 crawl）；CRM 是登录系统，CF 无法 crawl，所以 CRM 没法用 Always Online。

---

## 2. Cloudflare Notifications（邮件告警）

**作用**：tunnel 一断、SSL 证书过期、被攻击 — 都立刻发邮件给你。免费包含。

### 设置（5 分钟）

1. [dash.cloudflare.com](https://dash.cloudflare.com) → 右上角你的头像 → **Notifications**
2. 点 **Add** → 选下面 4 个类型：

| 通知类型 | 用途 |
|---|---|
| **Tunnel Health Alert** | tunnel 离线立即告警 ⭐⭐⭐ |
| **DNS Record Changed** | 任何人改 DNS 记录就告警（防误删）⭐⭐⭐ |
| **HTTP DDoS Attack** | 被 DDoS 攻击时告警 |
| **Universal SSL Issue** | SSL 证书有问题时告警 |

每条都填你的邮箱，确认。

---

## 3. UptimeRobot 第三方监控（独立于 Cloudflare）

**作用**：CF 自己挂了你也能知道。UptimeRobot 从全球 8 个节点每 5 分钟扫你的网站，故障时立刻发邮件 / SMS / Telegram。

### 设置（10 分钟）

1. 去 [uptimerobot.com](https://uptimerobot.com) → 注册免费账号（50 个 monitor 免费）
2. 点 **Add New Monitor**

### 创建 3 个监控

| Monitor Type | URL | Friendly Name | Interval |
|---|---|---|---|
| HTTPS | `https://www.tritonwealth.ca/` | Triton Wealth - 主站 | 5 min |
| HTTPS | `https://crm.tritonwealth.ca/` | Triton CRM | 5 min |
| Keyword (negative) | `https://www.tritonwealth.ca/` 关键词 `富瑞财富` | 内容完整性检查 | 5 min |

### 配 Alert Contact

在 **My Settings → Alert Contacts** 添加：
- 你的邮箱
- （可选）手机号收 SMS（需付费扩展，免费版只发邮件）
- （可选）Telegram bot（免费，强烈推荐 — 比邮件即时）

> 设好后，任何节点检测到失败都会**1 分钟内**给你发通知。

---

## 4. 部署新版 watchdog + 加 healthcheck

### 4.1 替换 watchdog 脚本（修复误报 bug）

新版在：`docs/hardening/ensure-tunnel-online-v2.sh`

```bash
# 在 NAS 上执行：
ssh wellce101@192.168.50.158
cp /volume1/docker/triton-crm/scripts/ensure-tunnel-online.sh \
   /volume1/docker/triton-crm/scripts/ensure-tunnel-online.sh.backup
# 然后用 v2 替换原文件（你从 git 拉新版后复制过去）
```

**新版改进**：
- 移除了误导性的"营销站检查"（marketing site 不走这个 tunnel，重启没用）
- 加了日志轮转（log 文件超过 1MB 自动归档）
- 优化了退出码（让 cron 能精确报错）

### 4.2 给 cloudflared 加 healthcheck（让 docker 自动重启异常容器）

参考：`docs/hardening/docker-compose.cloudflared.patch.yml`

需要给 docker-compose.yml 的 cloudflared 服务加：
1. `command:` 末尾加 `--metrics 0.0.0.0:2000`（让 tunnel 暴露 /ready 端点）
2. 加 `healthcheck:` 块（定时检查 /ready）

部署：
```bash
cd /volume1/docker/triton-crm/docker
# 编辑 docker-compose.yml 应用 patch
docker compose up -d cloudflared
```

**效果**：tunnel 只要 1.5 分钟内 3 次健康检查都失败，docker 会自动 kill + restart 容器，无需 watchdog 介入。

---

## 5. DNS 自动备份

**作用**：每周自动把 Cloudflare DNS 配置导出成 JSON 存起来。万一被误删，可以 1 分钟恢复。

### 5.1 创建 Cloudflare API token

1. [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token** → 选模板 **"Read all resources"**（或自定义：Zone:Read 限定 tritonwealth.ca）
3. Continue → Create Token
4. 复制 token（**只显示一次！**）

### 5.2 保存 token 到本地

```bash
echo "你刚复制的token" > ~/.cloudflare-token
chmod 600 ~/.cloudflare-token
```

### 5.3 测试备份脚本

```bash
cd "/Users/jeffreymacmini/TRITON WEBSITE"
./scripts/backup-cloudflare-dns.sh
```

应该看到 `✓ Backed up N DNS records to backups/dns-snapshots/...`

### 5.4 加入 macOS 计划任务（每周一备份）

```bash
# 编辑用户 crontab
crontab -e
# 加这一行（每周一 9:00 备份）
0 9 * * 1 cd "/Users/jeffreymacmini/TRITON WEBSITE" && ./scripts/backup-cloudflare-dns.sh
```

---

## 各项加固之间的关系（防御纵深）

```
访客访问 https://www.tritonwealth.ca
    ↓
Cloudflare Edge
    ├─ 1. Always Online → 即使 origin 挂，缓存快照仍返回 ✓
    ├─ 2. Notifications → 异常立即邮件告警 ✓
    └─ 3. UptimeRobot   → 第三方独立监控，不依赖 CF 自己 ✓
         ↓
    Cloudflare Pages (营销站，极稳)
         OR
    Cloudflare Tunnel (CRM)
         ├─ 4a. cloudflared healthcheck → docker 自动重启 ✓
         ├─ 4b. watchdog 脚本           → cron 兜底重启 ✓
         └─ docker restart=unless-stopped → 进程崩溃自启 ✓
              ↓
         NAS 上的 triton-crm 容器
              └─ CRM 自己的 healthcheck → 同样自动重启 ✓
```

**5 层防御**：CF 缓存 → 告警 → 第三方监控 → docker 自检 → watchdog 兜底

任何一层失效，其他层补位。

---

## 完成后的预期表现

| 故障 | 之前 | 加固后 |
|---|---|---|
| CRM tunnel 短暂掉线 | 用户看到 Error 1033 | docker 1.5 分钟内自动重启 |
| NAS 完全离线 | 营销网站和 CRM 都挂 | 营销网站照常服务（CF Pages）、CRM 显示维护页 |
| 路由器宕机 | 营销和 CRM 都挂 | 营销网站照常（不走 NAS）、CRM 1 分钟内你收到告警 |
| 有人误删 DNS | 全站不可访问 | 1 分钟收告警 + 从备份 JSON 一键恢复 |
| Cloudflare 自身故障 | 全站挂 | UptimeRobot 告警，你能立刻通知客户 |

---

## 完成顺序建议

1. **今天**：做 #1（Always Online）+ #2（Notifications） — 5 分钟，立即生效
2. **本周**：做 #3（UptimeRobot）+ #5（DNS 备份） — 各 10 分钟
3. **下次维护窗口**：做 #4（部署新 watchdog + healthcheck），需要 SSH 到 NAS 改文件
