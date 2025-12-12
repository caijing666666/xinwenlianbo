# Netlify 部署指南

## 🚀 **部署步骤**

### **第1步：访问Netlify**
1. 打开 https://netlify.com
2. 点击 "Sign up" 或 "Log in"
3. 选择 "GitHub" 登录方式

### **第2步：导入项目**
1. 登录后点击 "Add new site"
2. 选择 "Import an existing project"
3. 选择 "Deploy with GitHub"
4. 授权Netlify访问你的GitHub账号
5. 选择 `caijing666666/xinwenlianbo` 仓库

### **第3步：配置构建设置**
Netlify会自动检测到Next.js项目，但请确认以下设置：

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18 (已在netlify.toml中配置)

### **第4步：环境变量配置**
在部署设置中添加环境变量：

1. 点击 "Site settings"
2. 选择 "Environment variables"
3. 点击 "Add variable"
4. 添加以下变量：

```
QWEN_API_KEY = 你的千问API密钥
```

### **第5步：开始部署**
1. 点击 "Deploy site" 按钮
2. 等待构建完成（约2-5分钟）
3. 部署成功后会得到一个 `.netlify.app` 域名

## ⚙️ **配置说明**

### **netlify.toml 配置**
项目已包含优化的Netlify配置：
- Next.js插件自动处理
- API路由正确重定向
- Node.js 18版本
- 静态文件优化

### **环境变量**
- `QWEN_API_KEY`: 千问API密钥（必需）
- 其他KV存储变量在生产环境可选

## 🔧 **注意事项**

### **数据存储**
- **开发环境**: 使用本地文件存储
- **生产环境**: 需要配置云存储（Vercel KV或其他）
- **当前状态**: 会自动适配可用的存储后端

### **API限制**
- 千问API有调用频率限制
- 建议在生产环境配置缓存策略

### **域名配置**
- 免费版提供 `.netlify.app` 子域名
- 可以配置自定义域名（需要付费计划）

## 🎯 **部署后测试**

### **功能检查**
1. **主页访问**: 确认页面正常加载
2. **日期选择**: 测试日期查询功能
3. **API接口**: 检查数据加载是否正常
4. **月度总览**: 验证统计页面

### **常见问题**
- **构建失败**: 检查Node版本和依赖
- **API错误**: 确认环境变量配置
- **页面404**: 检查路由重定向设置

## 📊 **预期结果**

部署成功后，你将获得：
- 🌐 **在线地址**: `your-site-name.netlify.app`
- 📱 **响应式设计**: 支持移动端访问
- 🔒 **HTTPS**: 自动SSL证书
- 🚀 **CDN加速**: 全球内容分发网络

## 🎉 **部署完成**

部署成功后：
1. 测试所有功能是否正常
2. 分享你的在线投资分析系统
3. 享受专业的新闻联播投资分析服务！

祝部署顺利！🚀
