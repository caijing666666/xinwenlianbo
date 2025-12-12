# Netlify部署 - Vercel清理计划（可选）

## 当前状态
✅ 项目已经完全兼容Netlify部署，无需修改即可正常运行

## 可选清理步骤

### 1. 更新注释
```typescript
// 修改前：自动适配存储后端（开发=本地文件，生产=Vercel KV）
// 修改后：自动适配存储后端（开发=本地文件，生产=Netlify部署）
```

### 2. 移除未使用的依赖
```bash
npm uninstall @vercel/kv
```

### 3. 清理next.config.js
移除KV相关环境变量：
```javascript
env: {
  QWEN_API_KEY: process.env.QWEN_API_KEY,
  // 移除以下KV相关变量
  // KV_URL: process.env.KV_URL,
  // KV_REST_API_URL: process.env.KV_REST_API_URL,
  // KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  // KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
},
```

### 4. 删除未使用的文件
- `lib/storage.ts` (Vercel KV实现)
- `VERCEL_DEPLOYMENT.md`

## 建议
**保持现状即可**，因为：
1. 当前配置完全兼容Netlify
2. 保留了架构灵活性
3. 清理工作的收益有限
