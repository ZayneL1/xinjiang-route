# 新疆伊犁环线自驾路书

2026年7月11日至19日新疆伊犁环线自驾静态页面，包含：

- 高德真实道路路线图与每日筛选
- 日历式每日行程
- 分段里程和驾驶时间
- Plan A / B / C 方案结构
- 可持久保存的必带物品清单
- 手机端适配

## 本地运行

需要 Node.js 20 或更高版本：

```bash
npm start
```

打开 `http://localhost:3000`。

## Railway 部署

1. 在 Railway 创建项目并选择 `Deploy from GitHub repo`。
2. 选择本仓库。
3. Railway 会读取 `railway.json`，使用 `npm start` 启动。
4. 在服务设置中生成公开域名。

健康检查地址为 `/health`。

## 更新高德路线数据

高德 Key 只保存在本机 Codex MCP 配置中，不提交到仓库。更新路线数据：

```bash
python3 scripts/update_amap_route.py
```

脚本会重新生成：

- `amap-route-data.js`
- `amap-static-route.png`
