# 🚀 Vercel 部署完整指南

## 📋 数据存储方案说明

### 本地开发 vs Vercel 生产环境

项目使用了智能存储适配器（`lib/storage-adapter.ts`），可以自动切换存储方式：

| 环境 | 存储方式 | 说明 |
|------|---------|------|
| **本地开发** | 本地文件系统 | 数据存储在 `data/` 目录 |
| **Vercel 生产** | Vercel KV (Redis) | 云端 Redis 数据库 |

### 为什么需要 Vercel KV？

Vercel 的 Serverless 函数是**无状态**的，每次请求都可能在不同的服务器上执行，因此：

1. ❌ **不能使用本地文件系统** - 文件会在函数执行结束后丢失
2. ✅ **必须使用云数据库** - Vercel KV 是最佳选择
3. ✅ **自动配置** - Vercel KV 会自动注入环境变量

## 🎯 部署步骤

### 步骤 1：推送代码到 GitHub

```bash
# 确保代码已提交
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 步骤 2：在 Vercel 创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 选择你的 GitHub 仓库：`yanhuicsdn/news-investment-analyzer`
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 点击 **"Deploy"**（先不要急着部署，继续下一步）

### 步骤 3：配置环境变量

在部署前，先配置环境变量：

1. 在 Vercel 项目页面，进入 **Settings** → **Environment Variables**
2. 添加以下变量：

```env
# 千问 API Key（必需）
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
```

**注意**：暂时不需要配置 KV 相关的环境变量，下一步会自动配置。

### 步骤 4：添加 Vercel KV 数据库 ⭐ 重要

这是最关键的一步！

1. 在 Vercel 项目页面，进入 **Storage** 选项卡
2. 点击 **"Create Database"**
3. 选择 **"KV (Redis)"**
4. 配置数据库：
   - **Database Name**: `news-analyzer-kv`（或任意名称）
   - **Region**: 选择离你最近的区域（如 Singapore）
5. 点击 **"Create"**
6. 选择 **"Connect to Project"**，关联到你的项目

✅ **自动配置完成！** Vercel 会自动添加以下环境变量：
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 步骤 5：重新部署

环境变量配置完成后：

1. 回到 **Deployments** 选项卡
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 等待部署完成（约 1-2 分钟）

### 步骤 6：初始化数据

部署完成后，访问你的应用 URL（如 `https://your-app.vercel.app`）

现在你有两种方式初始化数据：

#### 方式 1：使用前端按钮（推荐）✨

1. 访问你的 Vercel 应用
2. 选择日期（建议选择昨天或前几天）
3. 点击 **"抓取新闻"** 按钮
4. 等待抓取完成
5. 点击 **"AI 分析"** 按钮
6. 等待分析完成
7. 刷新页面查看结果

#### 方式 2：使用本地命令行

如果你想在本地运行抓取和分析，需要先配置本地环境：

1. 复制 Vercel 的环境变量到本地 `.env` 文件：

```bash
# 从 Vercel Settings → Environment Variables 复制
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

2. 运行抓取和分析：

```bash
npm run scrape
npm run analyze
```

数据会直接存储到 Vercel KV 云数据库中。

## 🔄 自动化数据更新（可选）

### 方案 1：使用 Vercel Cron Jobs（推荐）

Vercel 提供了内置的定时任务功能。

1. 创建定时任务 API 路由：

```typescript
// app/api/cron/daily-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scrapeNewsData } from '@/lib/scraper';
import { saveMultipleNews } from '@/lib/storage-adapter';
import { analyzeMultipleNews } from '@/lib/analyzer';
import { saveMultipleAnalyses } from '@/lib/storage-adapter';

export async function GET(request: NextRequest) {
  // 验证 Vercel Cron 密钥
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 抓取今日新闻
    const newsList = await scrapeNewsData();
    await saveMultipleNews(newsList);

    // AI 分析
    const analyses = await analyzeMultipleNews(newsList);
    await saveMultipleAnalyses(analyses);

    return NextResponse.json({
      success: true,
      newsCount: newsList.length,
      analysisCount: analyses.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

2. 在 `vercel.json` 中配置定时任务：

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-update",
      "schedule": "0 21 * * *"
    }
  ]
}
```

3. 在 Vercel 环境变量中添加：

```env
CRON_SECRET=your-random-secret-key-here
```

### 方案 2：使用 GitHub Actions

创建 `.github/workflows/daily-analysis.yml`：

```yaml
name: Daily News Analysis

on:
  schedule:
    - cron: '0 13 * * *'  # 每天 21:00 北京时间 (13:00 UTC)
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

在 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions** 中添加所需的环境变量。

## 📊 数据存储详解

### Vercel KV 数据结构

Vercel KV 使用 Redis 的 Sorted Set 来存储数据：

```
# 新闻数据
news:{id}                    → NewsItem 对象
news:by-date                 → Sorted Set (score=timestamp, member=newsId)

# 分析数据
analysis:{newsId}            → InvestmentAnalysis 对象
analysis:by-date             → Sorted Set (score=timestamp, member=newsId)
```

### 数据查询示例

```typescript
// 获取指定日期的新闻
const startTime = new Date('2025-11-26').getTime();
const endTime = startTime + 24 * 60 * 60 * 1000;
const newsIds = await kv.zrangebyscore('news:by-date', startTime, endTime);

// 获取最近7天的分析
const endTime = Date.now();
const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
const analysisIds = await kv.zrangebyscore('analysis:by-date', startTime, endTime);
```

### 存储容量

- **Vercel KV 免费额度**: 256MB
- **单条新闻**: 约 2-5KB
- **单条分析**: 约 5-10KB
- **估算容量**: 可存储约 20,000-50,000 条记录

## 🔍 验证部署

### 1. 检查应用是否正常运行

访问你的 Vercel URL，应该能看到应用界面。

### 2. 检查 KV 数据库连接

在 Vercel 项目的 **Storage** 选项卡中，可以看到 KV 数据库的状态。

### 3. 测试数据抓取和分析

使用前端按钮测试完整流程：
1. 抓取新闻
2. AI 分析
3. 查看结果

### 4. 检查日志

在 Vercel 项目的 **Logs** 选项卡中查看运行日志，确认没有错误。

## ⚠️ 常见问题

### Q1: 为什么本地开发不需要 Vercel KV？

**A**: 本地开发使用文件系统存储（`data/` 目录），更方便调试。`storage-adapter.ts` 会自动检测环境并选择合适的存储方式。

### Q2: 如何在本地测试 Vercel KV？

**A**: 将 Vercel 的 KV 环境变量复制到本地 `.env` 文件，系统会自动使用 Vercel KV。

### Q3: 数据会丢失吗？

**A**: Vercel KV 是持久化存储，数据不会丢失。但建议定期备份重要数据。

### Q4: 如何清空数据库？

**A**: 在 Vercel Storage 选项卡中，可以删除并重新创建 KV 数据库。

### Q5: 抓取和分析任务会超时吗？

**A**: Vercel Serverless 函数有 10 秒超时限制（Hobby 计划）。如果新闻较多，建议：
- 分批处理
- 使用 Vercel Pro 计划（60 秒超时）
- 使用 GitHub Actions 在后台运行

## 💰 成本估算

### Vercel 费用

- **Hobby 计划**: 免费
  - 100GB 带宽/月
  - 100 次构建/天
  - 10 秒函数执行时间

- **Pro 计划**: $20/月（如需更长执行时间）
  - 1TB 带宽/月
  - 6000 次构建/月
  - 60 秒函数执行时间

### Vercel KV 费用

- **免费额度**: 256MB 存储 + 30,000 次命令/月
- **超出后**: $0.25/GB/月 + $0.20/100K 命令

### 千问 API 费用

- **qwen-max**: ¥0.04/1K input + ¥0.12/1K output
- **每天 10 条新闻**: 约 ¥1-2
- **每月**: 约 ¥30-60

💡 **省钱建议**: 使用 `qwen-plus` 模型可降低 90% 成本

## 🎉 完成！

现在你的新闻联播投资分析系统已经成功部署到 Vercel，并且：

✅ 使用 Vercel KV 云数据库存储数据  
✅ 支持前端按钮一键抓取和分析  
✅ 数据持久化，不会丢失  
✅ 可以配置自动化定时任务  

享受你的 AI 投资分析系统吧！🚀
