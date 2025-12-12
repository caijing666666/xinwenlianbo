# 🚀 快速启动指南

## 5 分钟快速上手

### 1️⃣ 安装依赖

```bash
cd news-investment-analyzer
npm install
```

### 2️⃣ 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的千问 API Key：

```env
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488
```

> 💡 **提示**：
> - 千问 API Key 已提供，可直接使用
> - 暂时不需要配置 Vercel KV，可以先用本地测试模式
> - 详细配置说明请查看 [QWEN_SETUP.md](./QWEN_SETUP.md)

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4️⃣ 抓取和分析数据

**终端 1 - 抓取新闻：**

```bash
npm run scrape
```

**终端 2 - AI 分析：**

```bash
npm run analyze
```

### 5️⃣ 查看结果

刷新浏览器页面，即可看到分析结果！

---

## 📋 常用命令

### 数据抓取

```bash
# 抓取今日新闻
npm run scrape

# 抓取指定日期（格式：YYYY-MM-DD）
npm run scrape 2024-01-15

# 抓取最近 7 天
npm run scrape "" 7
```

### AI 分析

```bash
# 分析今日新闻
npm run analyze

# 分析指定日期
npm run analyze 2024-01-15

# 分析最近 7 天
npm run analyze "" 7
```

### 开发和部署

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

---

## 🎯 功能演示

### 主界面功能

1. **日期选择器**：选择要查看的日期
2. **统计卡片**：显示新闻总数、市场情绪等
3. **四大分析维度**：
   - 📈 行业影响
   - 🏢 上市公司
   - 📦 期货商品
   - 🏛️ 债券市场

### 影响分析卡片

每个分析卡片包含：
- ✅ 影响评分（0-100）
- 📊 影响类型（利好/利空/中性）
- 📝 详细分析原因
- 🎯 置信度
- 🏷️ 相关标签和信息

### 排序规则

所有分析结果按影响评分从高到低排序，帮助你快速识别最重要的投资机会。

---

## 🔧 故障排除

### 问题：npm install 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题：抓取不到数据

**可能原因**：
1. 网站结构变化
2. 网络连接问题
3. 该日期没有新闻

**解决方案**：
- 检查网络连接
- 尝试抓取其他日期
- 查看控制台错误信息

### 问题：AI 分析失败

**可能原因**：
1. 千问 API Key 无效或过期
2. API 配额不足或余额不足
3. 网络问题

**解决方案**：
```bash
# 检查 API Key 是否正确
echo $QWEN_API_KEY

# 测试 API 连接（千问兼容 OpenAI 格式）
curl https://dashscope.aliyuncs.com/compatible-mode/v1/models \
  -H "Authorization: Bearer $QWEN_API_KEY"
```

### 问题：页面显示"暂无数据"

**解决方案**：
1. 确保已运行 `npm run scrape` 抓取数据
2. 确保已运行 `npm run analyze` 分析数据
3. 检查选择的日期是否有数据
4. 查看浏览器控制台错误

---

## 💡 使用技巧

### 1. 批量处理历史数据

```bash
# 抓取最近 30 天的数据
npm run scrape "" 30

# 分析最近 30 天的数据
npm run analyze "" 30
```

### 2. 每日自动化

**Windows（任务计划程序）：**
- 创建每日任务，在晚上 8 点后运行
- 命令：`npm run scrape && npm run analyze`

**macOS/Linux（crontab）：**
```bash
# 编辑 crontab
crontab -e

# 添加每日任务（每天 20:30）
30 20 * * * cd /path/to/news-investment-analyzer && npm run scrape && npm run analyze
```

### 3. 关注特定行业

在分析结果中使用浏览器搜索功能（Ctrl+F / Cmd+F）快速定位：
- 新能源
- 半导体
- 医药
- 房地产
- 消费

### 4. 导出数据

可以通过浏览器开发者工具的网络面板查看 API 返回的 JSON 数据，复制保存用于进一步分析。

---

## 📚 下一步

1. ✅ 阅读完整 [README.md](./README.md)
2. 🚀 查看 [部署指南](./DEPLOYMENT_GUIDE.md) 部署到 Vercel
3. 💻 自定义分析逻辑（修改 `lib/analyzer.ts`）
4. 🎨 定制界面样式（修改 Tailwind 配置）

---

## 🤔 常见问题

**Q: 需要多少费用？**

A: 
- Vercel 免费计划足够使用
- 千问 API (qwen-max) 每天约 ¥1-2（10条新闻）
- 使用 qwen-plus 每天约 ¥0.1-0.2
- 每月约 ¥3-60（取决于模型选择）

**Q: 可以分析其他新闻吗？**

A: 可以！修改 `lib/scraper.ts` 中的数据源即可。

**Q: 如何提高分析准确度？**

A: 
1. 使用更详细的 prompt
2. 增加行业和公司知识库
3. 多次分析取平均值
4. 结合历史数据验证

**Q: 能否添加通知功能？**

A: 可以！集成邮件服务（如 SendGrid）或消息推送服务（如 Telegram Bot）。

---

## 📞 需要帮助？

- 📖 查看 [README.md](./README.md) 了解详细信息
- 🐛 遇到问题？提交 [Issue](../../issues)
- 💬 有建议？提交 [Pull Request](../../pulls)

---

开始你的投资分析之旅吧！🚀
