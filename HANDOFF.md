# 上线交接单

> 2026-09-28 · 已完成 90%，剩一步只有你能做

## ✅ 已完成

```
GitHub    github.com/ken-fs/wowforever（公开）
Worker    wowforever  ·  hasAssets: true
线上      https://wowforever.493129720ljw.workers.dev     ← 现在就能访问
构建      push 到 main → 自动构建（实测 source=push_event, outcome=success）
zone      wowforever.one · id 915927540a00804212ce71ffa276b1f5 · status=pending
```

全站 96 条 sitemap URL，canonical 已指向 `https://wowforever.one/`，404 页正常。

## ⛔ 只剩这一步：改 NS（只有你能做）

Spaceship **没有** API 凭据在这台机器上，所以只能你去控制台改：

1. 登录 [spaceship.com](https://www.spaceship.com/) → **Domain Manager** → `wowforever.one`
2. 找 **Nameservers**（可能在 Advanced / DNS 里）→ 改成 **Custom**
3. 填这两个，删掉原来的：

```
daisy.ns.cloudflare.com
lochlan.ns.cloudflare.com
```

原值是 `launch1.spaceship.net` / `launch2.spaceship.net`，要删掉。

4. 保存。Cloudflare 那边通常几分钟到几小时生效。

> ⚠️ 如果改了 NS 但 zone 一直 `pending`：AGENTS.md 记过这个坑 ——
> 要去 Cloudflare dashboard 点一次「**立即检查名称服务器**」。
> zone 的 `modified_on` 停在创建后的几十秒不动 = 就是这个状态。

## ⏭️ 改完 NS 之后我做（告诉我一声即可）

按顺序，**不能跳**：

```
① 等 zone 变 active          ← ⚠️ 必须等！pending 时绑域名会导致证书签发失败且不重试
                              （AGENTS.md 坑 #2：TLS 握手读 0 字节直接断）
② 绑自定义域名到 Worker       POST /accounts/{acc}/workers/domains
③ 验证 https://wowforever.one 真的通
④ 如果 www 也要，一起绑
⑤ GSC 属性验证 + 提交 sitemap
⑥ IndexNow key（可选，加速收录）
```

## 📌 现在的临时地址

在域名生效前，站是活的，可以直接看：

**https://wowforever.493129720ljw.workers.dev**

⚠️ 注意 canonical 指向 `wowforever.one`，所以**现在别把这个地址公开**，
等域名绑好再推广。Google 现在爬到会产生指向未生效域名的 canonical。
