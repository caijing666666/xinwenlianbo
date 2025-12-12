# 🚀 Vercel 部署指南

## 快速部署步骤

### 1. 准备 GitHub 仓库

```bash
cd news-investment-analyzer
git init
git add .
git commit -m "Initial commit: 新闻联播投资分析系统"
```

### 2. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`news-investment-analyzer`
3. 设为 Public 或 Private
4. 不要初始化 README（我们已有）
5. 点击 Create repository

### 3. 推送代码到 GitHub

```bash
git remote add origin https://github.com/你的用户名/news-investment-analyzer.git
git branch -M main
git push -u origin main
```

### 4. 部署到 Vercel

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你的 `news-investment-analyzer` 仓库
5. 配置如下：
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 5. 配置环境变量

在 Vercel 项目设置中添加：

**必需环境变量**：
```
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
```

### 6. 添加 Vercel KV 数据库（推荐）

1. 在 Vercel 项目中，进入 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "KV (Redis)"
4. 创建数据库
5. 自动关联到项目（环境变量自动配置）

### 7. 重新部署

点击 "Redeploy" 使环境变量生效。

---

## ⚠️ 重要说明

### 数据存储方案

当前项目使用**本地文件存储**，Vercel 是无状态的，需要切换到 **Vercel KV**：

**选项 1：使用 Vercel KV（推荐）**
- 修改导入：将 `local-storage` 改为 `storage`
- Vercel KV 自动持久化数据
- 成本：免费 256MB

**选项 2：保持本地存储（仅用于演示）**
- 每次部署后数据会丢失
- 不适合生产环境

### 定时任务

在 Vercel 配置 Cron Jobs 实现每日自动抓取和分析：

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "30 12 * * *"
    },
    {
      "path": "/api/cron/analyze",
      "schedule": "0 13 * * *"
    }
  ]
}
```

---

## 💰 成本估算

- **Vercel Hosting**: 免费
- **Vercel KV**: 免费 256MB
- **千问 API**: 每天约 ¥1-2

---

## 🔗 访问地址

部署完成后，Vercel 会提供：
- 生产地址：`https://你的项目名.vercel.app`
- 自定义域名（可选）

---

## 🐛 常见问题

**Q: 部署失败？**
- 检查环境变量是否配置
- 查看 Vercel 部署日志

**Q: 数据无法保存？**
- 确认 Vercel KV 已创建并关联
- 检查环境变量是否包含 KV_* 变量

**Q: API 调用失败？**
- 确认 QWEN_API_KEY 已配置
- 检查千问账户余额

---

## 📞 需要帮助？

查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细说明。
