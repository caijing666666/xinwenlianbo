# 📁 项目结构说明

## 目录结构

```
news-investment-analyzer/
├── app/                          # Next.js 应用目录
│   ├── api/                      # API 路由
│   │   ├── news/                 # 新闻数据 API
│   │   │   └── route.ts
│   │   ├── analysis/             # 分析结果 API
│   │   │   └── route.ts
│   │   └── summary/              # 汇总数据 API
│   │       └── route.ts
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
│
├── components/                   # React 组件
│   ├── ui/                       # UI 基础组件
│   │   ├── card.tsx              # 卡片组件
│   │   ├── tabs.tsx              # 标签页组件
│   │   └── badge.tsx             # 徽章组件
│   ├── AnalysisDashboard.tsx     # 主分析面板
│   └── ImpactCard.tsx            # 影响分析卡片
│
├── lib/                          # 核心业务逻辑
│   ├── scraper.ts                # 新闻数据抓取
│   ├── analyzer.ts               # AI 分析引擎
│   ├── storage.ts                # 数据存储（Vercel KV）
│   └── utils.ts                  # 工具函数
│
├── scripts/                      # 脚本文件
│   ├── scrape-news.ts            # 抓取新闻脚本
│   └── analyze-news.ts           # 分析新闻脚本
│
├── types/                        # TypeScript 类型定义
│   └── index.ts                  # 所有类型定义
│
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略文件
├── .eslintrc.json                # ESLint 配置
├── next.config.js                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── postcss.config.js             # PostCSS 配置
├── package.json                  # 项目依赖
├── vercel.json                   # Vercel 部署配置
│
├── README.md                     # 项目说明
├── QUICK_START.md                # 快速启动指南
├── DEPLOYMENT_GUIDE.md           # 部署指南
└── PROJECT_STRUCTURE.md          # 本文件
```

## 核心文件说明

### 📊 数据流程

```
新闻源 → scraper.ts → storage.ts → analyzer.ts → storage.ts → API → 前端展示
```

### 🔧 核心模块

#### 1. lib/scraper.ts
**功能**：从新闻联播网站抓取数据

**主要函数**：
- `scrapeNewsData(date)` - 抓取指定日期的新闻
- `scrapeRecentNews(days)` - 抓取最近N天的新闻

**技术**：
- Axios（HTTP 请求）
- Cheerio（HTML 解析）

#### 2. lib/analyzer.ts
**功能**：使用 AI 分析新闻影响

**主要函数**：
- `analyzeNewsImpact(news)` - 分析单条新闻
- `analyzeMultipleNews(newsList)` - 批量分析

**技术**：
- OpenAI GPT-4
- Structured Output（JSON 格式）

**分析维度**：
- 行业影响（industryImpacts）
- 公司影响（companyImpacts）
- 期货影响（futuresImpacts）
- 债券影响（bondImpacts）

#### 3. lib/storage.ts
**功能**：数据持久化存储

**主要函数**：
- `saveNews()` / `getNewsByDate()` - 新闻数据
- `saveAnalysis()` / `getAnalysisByDate()` - 分析结果
- `generateDailySummary()` - 生成每日汇总

**技术**：
- Vercel KV (Redis)
- Sorted Sets（按时间排序）

#### 4. components/AnalysisDashboard.tsx
**功能**：主展示面板

**特性**：
- 四个维度的标签页切换
- 实时数据统计
- 响应式设计
- 交互式卡片

#### 5. components/ImpactCard.tsx
**功能**：影响分析卡片组件

**特性**：
- 评分展示
- 类型标识（利好/利空/中性）
- 置信度显示
- 附加信息展示

### 🎨 UI 组件体系

采用 **Radix UI + Tailwind CSS + shadcn/ui** 设计系统：

- **Card**：卡片容器
- **Tabs**：标签页切换
- **Badge**：标签徽章
- 完全可定制的样式系统

### 📡 API 路由

#### GET /api/news
获取新闻数据

**参数**：
- `date` - 指定日期（YYYY-MM-DD）
- `days` - 最近天数

**返回**：
```typescript
{
  success: boolean;
  data: NewsItem[];
}
```

#### GET /api/analysis
获取分析结果

**参数**：
- `date` - 指定日期
- `days` - 最近天数

**返回**：
```typescript
{
  success: boolean;
  data: InvestmentAnalysis[];
}
```

#### GET /api/summary
获取每日汇总

**参数**：
- `date` - 指定日期

**返回**：
```typescript
{
  success: boolean;
  data: AnalysisSummary;
}
```

## 数据模型

### NewsItem（新闻条目）
```typescript
{
  id: string;           // 唯一标识
  date: string;         // 日期
  title: string;        // 标题
  content: string;      // 内容
  sourceUrl: string;    // 来源URL
  scrapedAt: string;    // 抓取时间
}
```

### InvestmentAnalysis（投资分析）
```typescript
{
  newsId: string;
  newsDate: string;
  newsTitle: string;
  newsContent: string;
  
  industryImpacts: IndustryImpact[];
  companyImpacts: CompanyImpact[];
  futuresImpacts: FuturesImpact[];
  bondImpacts: BondImpact[];
  
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  investmentOpportunityScore: number;
  summary: string;
  analyzedAt: string;
}
```

## 技术栈详解

### 前端框架
- **Next.js 14**：React 框架，支持 SSR、API Routes
- **React 18**：UI 库
- **TypeScript**：类型安全

### UI 层
- **Tailwind CSS**：原子化 CSS 框架
- **Radix UI**：无样式组件库
- **shadcn/ui**：组件设计系统
- **Lucide React**：图标库

### 后端服务
- **Next.js API Routes**：服务端 API
- **Vercel KV**：Redis 数据库
- **OpenAI API**：AI 分析引擎

### 数据处理
- **Axios**：HTTP 客户端
- **Cheerio**：HTML 解析
- **date-fns**：日期处理
- **Zod**：数据验证

## 开发工作流

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在另一个终端运行数据抓取
npm run scrape

# 运行 AI 分析
npm run analyze
```

### 2. 数据处理流程

```
1. 抓取 → scrape-news.ts → lib/scraper.ts → Vercel KV
2. 分析 → analyze-news.ts → lib/analyzer.ts → OpenAI → Vercel KV
3. 展示 → page.tsx → API Routes → 前端组件
```

### 3. 部署流程

```
本地开发 → Git Push → Vercel 自动部署 → 配置环境变量 → 生产环境
```

## 扩展指南

### 添加新的分析维度

1. 在 `types/index.ts` 中添加新类型
2. 在 `lib/analyzer.ts` 中更新分析逻辑
3. 在 `components/AnalysisDashboard.tsx` 中添加展示组件

### 更换数据源

修改 `lib/scraper.ts`：
```typescript
const BASE_URL = 'your-new-data-source';
// 更新选择器和解析逻辑
```

### 自定义 AI Prompt

修改 `lib/analyzer.ts` 中的 prompt 文本，调整分析重点和输出格式。

### 添加新的存储后端

实现 `lib/storage.ts` 接口，可以切换到：
- PostgreSQL
- MongoDB
- Supabase
- Firebase

## 性能优化

### 前端优化
- ✅ React Server Components
- ✅ 自动代码分割
- ✅ 图片优化（next/image）
- ✅ 字体优化

### 后端优化
- ✅ Redis 缓存
- ✅ API 响应压缩
- ✅ 增量更新策略

### AI 调用优化
- ✅ 批量处理
- ✅ 结果缓存
- ✅ 失败重试机制

## 安全考虑

- ✅ 环境变量保护（.env）
- ✅ API Key 不暴露到前端
- ✅ CORS 配置
- ✅ 输入验证
- ⚠️ 生产环境建议添加认证中间件

## 监控和日志

建议添加：
- 错误追踪（Sentry）
- 性能监控（Vercel Analytics）
- 日志聚合（Logtail）

---

## 🎓 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)

---

有问题？查看 [README.md](./README.md) 或 [QUICK_START.md](./QUICK_START.md)
