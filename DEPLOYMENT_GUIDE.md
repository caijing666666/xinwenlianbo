# 🚀 部署指南

## 前置要求

1. ✅ GitHub 账号
2. ✅ Vercel 账号（可以用 GitHub 登录）
3. ✅ 千问 API Key（阿里云账号，已提供：sk-fefa9fed5599445abd3532c3b8187488）

## 详细部署步骤

### 步骤 1：准备代码

1. 将项目代码推送到 GitHub：

\`\`\`bash
cd news-investment-analyzer
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

### 步骤 2：部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. 项目配置：
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 步骤 3：配置环境变量

在 Vercel 项目设置中添加环境变量：

1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：

\`\`\`
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
\`\`\`

### 步骤 4：添加 Vercel KV 存储

1. 在 Vercel 项目中，进入 Storage 选项卡
2. 点击 "Create Database"
3. 选择 "KV (Redis)"
4. 创建数据库（自动关联到项目）
5. 环境变量会自动配置：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 步骤 5：重新部署

环境变量配置完成后，点击 "Redeploy" 重新部署项目。

### 步骤 6：运行初始数据抓取

部署完成后，需要在本地或通过 API 运行数据抓取和分析：

**方式一：本地运行（推荐）**

1. 在本地项目中配置 `.env` 文件（复制 Vercel 的环境变量）
2. 运行抓取和分析：

\`\`\`bash
npm run scrape
npm run analyze
\`\`\`

**方式二：创建 API 端点**

创建 API 路由用于远程触发：

\`\`\`typescript
// app/api/cron/scrape/route.ts
import { NextResponse } from 'next/server';
import { scrapeNewsData } from '@/lib/scraper';
import { saveMultipleNews } from '@/lib/storage';

export async function POST(request: Request) {
  // 验证密钥（安全考虑）
  const authHeader = request.headers.get('authorization');
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const news = await scrapeNewsData();
  await saveMultipleNews(news);
  
  return NextResponse.json({ success: true, count: news.length });
}
\`\`\`

然后通过 curl 或 Postman 调用：

\`\`\`bash
curl -X POST https://your-app.vercel.app/api/cron/scrape \\
  -H "Authorization: Bearer your-secret-key"
\`\`\`

### 步骤 7：配置自动化（可选）

**使用 Vercel Cron Jobs：**

1. 在项目根目录创建 `vercel.json`：

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 20 * * *"
    },
    {
      "path": "/api/cron/analyze",
      "schedule": "30 20 * * *"
    }
  ]
}
\`\`\`

2. 创建对应的 API 路由
3. 重新部署

**使用 GitHub Actions：**

创建 `.github/workflows/daily-analysis.yml`：

\`\`\`yaml
name: Daily News Analysis

on:
  schedule:
    - cron: '0 20 * * *'  # 每天 20:00 UTC
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
        
      - name: Scrape news
        run: npm run scrape
        env:
          QWEN_API_KEY: \${{ secrets.QWEN_API_KEY }}
          KV_URL: \${{ secrets.KV_URL }}
          KV_REST_API_URL: \${{ secrets.KV_REST_API_URL }}
          KV_REST_API_TOKEN: \${{ secrets.KV_REST_API_TOKEN }}
          
      - name: Analyze news
        run: npm run analyze
        env:
          QWEN_API_KEY: \${{ secrets.QWEN_API_KEY }}
          KV_URL: \${{ secrets.KV_URL }}
          KV_REST_API_URL: \${{ secrets.KV_REST_API_URL }}
          KV_REST_API_TOKEN: \${{ secrets.KV_REST_API_TOKEN }}
\`\`\`

在 GitHub 仓库的 Settings → Secrets 中添加所需的环境变量。

## 验证部署

1. 访问你的 Vercel 应用 URL
2. 选择日期查看分析结果
3. 检查各个功能模块是否正常工作

## 故障排查

### 问题 1：页面显示"暂无数据"

**原因**：数据库中没有数据

**解决**：
- 运行 `npm run scrape` 抓取数据
- 运行 `npm run analyze` 分析数据

### 问题 2：API 返回 500 错误

**原因**：环境变量未配置或配置错误

**解决**：
- 检查 Vercel 项目的环境变量设置
- 确保千问 API Key 有效（sk-fefa9fed5599445abd3532c3b8187488）
- 确保 Vercel KV 已创建并关联

### 问题 3：AI 分析失败

**原因**：千问 API 调用失败

**解决**：
- 检查千问 API Key 是否正确（sk-fefa9fed5599445abd3532c3b8187488）
- 确认阿里云账户余额充足
- 检查 API 额度是否充足
- 访问 [阿里云控制台](https://dashscope.console.aliyun.com/) 查看调用详情

### 问题 4：数据抓取失败

**原因**：目标网站结构变化或访问限制

**解决**：
- 检查网站是否可访问
- 更新 `lib/scraper.ts` 中的选择器
- 添加适当的延时和重试机制

## 成本估算

- **Vercel**：Hobby 免费计划足够使用
- **Vercel KV**：免费额度 256MB，足够存储几个月的数据
- **千问 API**（qwen-max）：
  - 每条新闻分析约消耗 2000-3000 tokens
  - 价格：¥0.04/1K input tokens, ¥0.12/1K output tokens
  - 每天 10 条新闻约 ¥1-2
  - 每月约 ¥30-60

💡 **省钱建议**：使用 qwen-plus 模型可降低 90% 成本（每月约 ¥3-6）

## 优化建议

1. **缓存策略**：对相同内容的分析结果进行缓存
2. **批量处理**：一次请求分析多条新闻，减少 API 调用
3. **模型选择**：非关键分析可以使用 qwen-plus 或 qwen-turbo 降低成本
4. **增量更新**：只分析新增的新闻，避免重复分析

## 下一步

✅ 部署完成后，你的新闻联播投资分析系统就可以正式使用了！

建议每天定时运行数据抓取和分析，保持数据更新。
