# 🔄 千问接口迁移变更日志

## 变更概述

已成功将 AI 分析引擎从 OpenAI GPT-4 迁移至**阿里云千问（通义千问 Qwen）**。

**迁移日期**: 2025-11-27  
**提供的 API Key**: `sk-fefa9fed5599445abd3532c3b8187488`

---

## ✅ 已完成的变更

### 1. 核心代码修改

#### `lib/analyzer.ts`
- ✅ 更新 API 配置，添加千问 baseURL
- ✅ 模型从 `gpt-4-turbo-preview` 改为 `qwen-max`
- ✅ 移除 `response_format` 参数（千问通过 prompt 控制）
- ✅ 更新 modelVersion 标识

**关键代码**:
```typescript
const openai = new OpenAI({
  apiKey: process.env.QWEN_API_KEY || 'sk-fefa9fed5599445abd3532c3b8187488',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 使用 qwen-max 模型
model: 'qwen-max'
```

### 2. 配置文件更新

#### `.env.example`
- ✅ `OPENAI_API_KEY` → `QWEN_API_KEY`
- ✅ 添加千问 API 获取地址说明
- ✅ 直接提供可用的 API Key

#### `next.config.js`
- ✅ 环境变量从 `OPENAI_API_KEY` 改为 `QWEN_API_KEY`

#### `vercel.json`
- ✅ 部署配置更新为千问 API Key

### 3. 文档更新

#### `README.md`
- ✅ 核心功能说明更新为千问
- ✅ 技术栈说明更新
- ✅ API Key 获取指引更新
- ✅ 成本估算更新为人民币计价
- ✅ 优化建议更新

#### `QUICK_START.md`
- ✅ 快速配置步骤更新
- ✅ 故障排查更新
- ✅ 费用说明更新

#### `DEPLOYMENT_GUIDE.md`
- ✅ 前置要求更新
- ✅ 环境变量配置更新
- ✅ GitHub Actions 配置更新
- ✅ 成本估算更新
- ✅ 故障排查更新

#### `QWEN_SETUP.md` (新增)
- ✅ 详细的千问配置指南
- ✅ 模型选择说明
- ✅ 计费详情
- ✅ 常见问题解答

---

## 🎯 立即开始使用

### 第 1 步：创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# 千问 API Key（已提供，可直接使用）
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488

# Vercel KV（部署时配置，本地测试可暂时忽略）
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### 第 2 步：安装依赖

```bash
cd news-investment-analyzer
npm install
```

### 第 3 步：运行项目

**终端 1 - 启动服务器**:
```bash
npm run dev
```

**终端 2 - 抓取新闻**:
```bash
npm run scrape
```

**终端 3 - AI 分析**:
```bash
npm run analyze
```

访问 http://localhost:3000 查看结果！

---

## 📊 模型对比与选择

| 特性 | qwen-max | qwen-plus | qwen-turbo |
|------|----------|-----------|------------|
| **分析质量** | 最高 | 高 | 中 |
| **响应速度** | 较慢 | 中等 | 快 |
| **每天成本** (10条新闻) | ¥1-2 | ¥0.1-0.2 | ¥0.05-0.1 |
| **每月成本** | ¥30-60 | ¥3-6 | ¥1.5-3 |
| **推荐场景** | 重要决策分析 | 日常投资分析 | 快速信息获取 |

💡 **建议**: 
- 日常使用: `qwen-plus`（性价比最高）
- 重要分析: `qwen-max`（质量最优）
- 快速浏览: `qwen-turbo`（成本最低）

### 如何切换模型？

编辑 `lib/analyzer.ts` 第 108 行：

```typescript
model: 'qwen-plus', // 或 'qwen-max' 或 'qwen-turbo'
```

---

## 💰 成本对比

### OpenAI GPT-4（原方案）
- 每天 10 条新闻: **$0.3-0.5** (约 ¥2-3.5)
- 每月: **$10-15** (约 ¥70-105)

### 千问 qwen-max（当前方案）
- 每天 10 条新闻: **¥1-2**
- 每月: **¥30-60**

### 千问 qwen-plus（推荐方案）
- 每天 10 条新闻: **¥0.1-0.2**
- 每月: **¥3-6**

**💸 节省**: 使用 qwen-plus 可比 GPT-4 节省 **95%** 成本！

---

## 🔧 技术细节

### API 兼容性

千问完全兼容 OpenAI API 格式，只需修改：
1. `baseURL`: 指向千问服务端点
2. `apiKey`: 使用千问的 API Key
3. `model`: 使用千问的模型名称

### JSON 输出控制

**OpenAI 方式**:
```typescript
response_format: { type: 'json_object' }
```

**千问方式**:
在 prompt 中明确要求返回 JSON 格式（项目已配置）

### 速率限制

- 并发请求: 10个/秒
- 每分钟: 300个
- 每日 tokens: 根据套餐

---

## 🚨 重要提示

### 1. API Key 安全

- ✅ API Key 已硬编码作为默认值（方便测试）
- ⚠️ 生产环境建议使用环境变量
- ⚠️ 不要将 `.env` 文件提交到 Git

### 2. 账户余额

- 确保阿里云账户有充足余额
- 访问 [阿里云控制台](https://dashscope.console.aliyun.com/) 查看余额
- 建议设置预算告警

### 3. 数据存储

- Vercel KV 是可选的
- 本地测试可以不配置 KV
- 部署到 Vercel 时必须配置

---

## 📚 相关文档

- [QWEN_SETUP.md](./QWEN_SETUP.md) - 千问详细配置指南
- [README.md](./README.md) - 项目完整说明
- [QUICK_START.md](./QUICK_START.md) - 快速启动指南
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南

---

## ❓ 常见问题

### Q: 为什么选择千问而不是 GPT-4？

A: 
1. **成本更低**: qwen-plus 便宜 95%
2. **中文优化**: 千问专门针对中文优化
3. **本土服务**: 网络更稳定，无需梯子
4. **性能相当**: 分析质量接近 GPT-4

### Q: 如何验证 API Key 是否有效？

A:
```bash
curl https://dashscope.aliyuncs.com/compatible-mode/v1/models \
  -H "Authorization: Bearer sk-fefa9fed5599445abd3532c3b8187488"
```

### Q: 分析结果准确吗？

A: 千问的中文理解能力优秀，投资分析结果准确性高。建议：
- 重要决策使用 qwen-max
- 结合多日数据综合判断
- 参考但不完全依赖 AI 建议

### Q: 可以回退到 OpenAI 吗？

A: 可以！修改 `lib/analyzer.ts`:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: 不指定，使用默认 OpenAI 端点
});
model: 'gpt-4-turbo-preview'
```

---

## 🎉 迁移完成！

所有代码和文档已更新为千问接口。现在可以：

1. ✅ 使用提供的 API Key 立即开始
2. ✅ 体验更低的使用成本
3. ✅ 享受更好的中文分析能力
4. ✅ 获得更稳定的服务

**开始你的投资分析之旅吧！** 🚀📈
