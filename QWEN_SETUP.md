# 🤖 千问（通义千问）配置指南

本项目使用阿里云的**千问（通义千问 Qwen）**大语言模型进行新闻分析。

## 📋 配置步骤

### 1. 获取 API Key

你的 API Key 已经提供：
```
sk-fefa9fed5599445abd3532c3b8187488
```

如需重新获取或管理 API Key：
1. 访问 [阿里云百炼平台](https://dashscope.console.aliyun.com/)
2. 登录你的阿里云账号
3. 进入 "API-KEY 管理"
4. 创建或查看你的 API Key

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 千问 API Key
QWEN_API_KEY=sk-fefa9fed5599445abd3532c3b8187488

# Vercel KV (可选，部署时配置)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### 3. 测试连接

运行以下命令测试 API 连接：

```bash
npm run dev
npm run scrape
npm run analyze
```

如果一切正常，你应该看到分析结果。

## 🎯 千问模型选择

项目默认使用 `qwen-max`（最强模型），你可以根据需求调整：

### 可用模型

| 模型 | 说明 | 适用场景 | 相对成本 |
|------|------|----------|----------|
| **qwen-max** | 最强模型 | 复杂分析、高精度要求 | 高 |
| **qwen-plus** | 平衡模型 | 日常分析、性价比高 | 中 |
| **qwen-turbo** | 快速模型 | 简单分析、快速响应 | 低 |

### 修改模型

编辑 `lib/analyzer.ts` 文件，第 108 行：

```typescript
model: 'qwen-max', // 改为 'qwen-plus' 或 'qwen-turbo'
```

## 💰 计费说明

千问按 token 计费：

- **qwen-max**: ¥0.04/1k tokens（输入）+ ¥0.12/1k tokens（输出）
- **qwen-plus**: ¥0.004/1k tokens（输入）+ ¥0.012/1k tokens（输出）
- **qwen-turbo**: ¥0.002/1k tokens（输入）+ ¥0.006/1k tokens（输出）

**每日估算**（10条新闻）：
- qwen-max: 约 ¥1-2
- qwen-plus: 约 ¥0.1-0.2
- qwen-turbo: 约 ¥0.05-0.1

💡 **省钱建议**：日常使用 `qwen-plus`，重要分析时切换到 `qwen-max`

## 🔧 API 特性

### 兼容 OpenAI 格式

千问 API 完全兼容 OpenAI 的调用格式，只需修改：
- `baseURL`: 指向千问服务
- `apiKey`: 使用千问的 API Key
- `model`: 使用千问的模型名称

### JSON 输出

千问通过 prompt 控制输出格式（不需要 `response_format` 参数）。项目中的 prompt 已经明确要求返回 JSON 格式。

### 速率限制

- **并发请求**: 最多 10 个/秒
- **每分钟请求**: 最多 300 个
- **每日 tokens**: 根据你的套餐

## 🚨 常见问题

### Q: API Key 无效？

**检查步骤**：
1. 确认 API Key 格式正确（sk- 开头）
2. 检查账户余额是否充足
3. 确认 API Key 未过期

### Q: 请求失败或超时？

**解决方案**：
1. 检查网络连接
2. 增加请求间隔（修改 `lib/analyzer.ts` 第 163 行）
3. 使用更快的模型（qwen-turbo）

### Q: 返回结果不是 JSON？

**解决方案**：
1. 检查 prompt 是否明确要求 JSON
2. 增加示例（项目已包含）
3. 降低 temperature 参数（提高确定性）

### Q: 分析质量不理想？

**优化建议**：
1. 使用 qwen-max 获得最佳效果
2. 优化 prompt 描述
3. 增加更多示例和约束

## 📊 性能对比

| 指标 | qwen-max | qwen-plus | qwen-turbo |
|------|----------|-----------|------------|
| 响应速度 | 较慢 | 中等 | 快 |
| 分析精度 | 最高 | 高 | 中 |
| 中文理解 | 优秀 | 优秀 | 良好 |
| 成本 | 高 | 中 | 低 |

## 🔐 安全提示

1. ✅ **不要提交** `.env` 文件到 Git
2. ✅ **不要硬编码** API Key 在代码中（除非用于示例）
3. ✅ **定期轮换** API Key
4. ✅ **监控用量** 避免超额费用
5. ✅ **设置预算** 在阿里云控制台

## 🌐 相关链接

- [阿里云百炼平台](https://dashscope.console.aliyun.com/)
- [千问模型文档](https://help.aliyun.com/zh/dashscope/developer-reference/model-square)
- [API 参考文档](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
- [计费说明](https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-metering-and-billing)

## 📞 技术支持

遇到问题？
1. 查看 [阿里云工单系统](https://workorder.console.aliyun.com/)
2. 访问 [通义千问社区](https://tongyi.aliyun.com/)
3. 查阅 [帮助文档](https://help.aliyun.com/zh/dashscope/)

---

**配置完成后，运行项目即可开始使用千问进行新闻分析！** 🚀
