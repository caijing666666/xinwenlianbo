# ⏰ 自动化定时任务配置指南

## 概述

本项目支持通过 Vercel Cron Jobs 实现每日自动抓取和分析新闻，无需手动操作。

## 🎯 功能说明

- **自动抓取**: 每天定时抓取新闻联播数据
- **自动分析**: 使用 AI 自动分析新闻内容
- **自动存储**: 结果自动保存到 Vercel KV 数据库
- **无需干预**: 完全自动化，无需手动运行命令

## 📅 定时任务配置

### 当前配置

在 `vercel.json` 中已配置：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-update",
      "schedule": "0 13 * * *"
    }
  ]
}
```

**执行时间**: 每天 21:00 北京时间（13:00 UTC）

### 修改执行时间

如果需要修改执行时间，编辑 `vercel.json` 中的 `schedule` 字段：

```
格式: "分 时 日 月 星期"

示例:
"0 13 * * *"   - 每天 21:00 北京时间 (13:00 UTC)
"0 12 * * *"   - 每天 20:00 北京时间 (12:00 UTC)
"30 13 * * *"  - 每天 21:30 北京时间 (13:30 UTC)
"0 13 * * 1-5" - 工作日 21:00 北京时间
```

**注意**: Vercel 使用 UTC 时间，北京时间需要减去 8 小时。

## 🔧 部署步骤

### 1. 配置环境变量

在 Vercel 项目设置中添加（如果还没有）：

```env
# 必需
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488

# 可选（用于安全验证）
CRON_SECRET=your-random-secret-key-here
```

**生成随机密钥**:
```bash
openssl rand -base64 32
```

### 2. 部署到 Vercel

```bash
git add .
git commit -m "Add cron job configuration"
git push origin main
```

Vercel 会自动检测 `vercel.json` 中的 `crons` 配置并启用定时任务。

### 3. 验证配置

1. 访问 Vercel 项目的 **Settings** → **Cron Jobs**
2. 应该能看到配置的定时任务
3. 查看下次执行时间

## 🧪 测试定时任务

### 方法 1: 手动触发（推荐）

使用 curl 命令手动触发：

```bash
# 不使用密钥（如果未配置 CRON_SECRET）
curl https://your-app.vercel.app/api/cron/daily-update

# 使用密钥（如果配置了 CRON_SECRET）
curl https://your-app.vercel.app/api/cron/daily-update \
  -H "Authorization: Bearer your-cron-secret"
```

### 方法 2: 在浏览器中访问

直接访问：
```
https://your-app.vercel.app/api/cron/daily-update
```

### 预期响应

成功时：
```json
{
  "success": true,
  "message": "每日更新任务完成",
  "date": "2025-11-27",
  "newsCount": 14,
  "analysisCount": 14,
  "statistics": {
    "industries": 27,
    "companies": 21,
    "futures": 10,
    "bonds": 13,
    "sentiment": {
      "bullish": 8,
      "bearish": 2,
      "neutral": 4
    }
  },
  "timestamp": "2025-11-27T13:00:00.000Z"
}
```

失败时：
```json
{
  "success": false,
  "error": "错误信息",
  "timestamp": "2025-11-27T13:00:00.000Z"
}
```

## 📊 监控和日志

### 查看执行日志

1. 访问 Vercel 项目的 **Logs** 选项卡
2. 筛选 `/api/cron/daily-update` 路径
3. 查看执行结果和错误信息

### 日志内容

成功执行时会看到：
```
🤖 开始每日自动更新任务...
📰 抓取今日新闻...
✅ 成功抓取 14 条新闻
💾 保存新闻数据...
✅ 新闻数据保存完成
🧠 开始 AI 分析...
✅ 成功分析 14 条新闻
💾 保存分析结果...
✅ 分析结果保存完成
🎉 每日更新任务完成！
```

## ⚠️ 注意事项

### 1. 执行时间限制

- **Hobby 计划**: 10 秒超时
- **Pro 计划**: 60 秒超时

如果新闻数量较多，可能会超时。建议：
- 升级到 Pro 计划
- 或者分批处理（修改代码限制每次处理的新闻数量）

### 2. API 费用

每次执行会调用千问 API，产生费用：
- 每天 10 条新闻约 ¥1-2
- 每月约 ¥30-60

### 3. 数据库容量

Vercel KV 免费额度 256MB，足够存储几个月的数据。

### 4. 错误处理

如果定时任务失败：
1. 检查 Vercel Logs 查看错误信息
2. 确认环境变量配置正确
3. 确认千问 API Key 有效且有余额
4. 确认 Vercel KV 数据库正常运行

## 🔄 备选方案：GitHub Actions

如果不想使用 Vercel Cron Jobs，可以使用 GitHub Actions：

创建 `.github/workflows/daily-analysis.yml`:

```yaml
name: Daily News Analysis

on:
  schedule:
    - cron: '0 13 * * *'  # 每天 21:00 北京时间
  workflow_dispatch:  # 允许手动触发

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Scrape and analyze news
        run: |
          npm run scrape
          npm run analyze
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
          KV_URL: ${{ secrets.KV_URL }}
          KV_REST_API_URL: ${{ secrets.KV_REST_API_URL }}
          KV_REST_API_TOKEN: ${{ secrets.KV_REST_API_TOKEN }}
```

在 GitHub 仓库的 Settings → Secrets 中添加环境变量。

## 🎉 完成

现在你的系统会每天自动：
1. ✅ 抓取新闻联播数据
2. ✅ 使用 AI 进行智能分析
3. ✅ 保存结果到云数据库
4. ✅ 用户访问时自动显示最新数据

完全自动化，无需任何手动操作！🚀
