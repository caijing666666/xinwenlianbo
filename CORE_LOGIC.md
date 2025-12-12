# 新闻联播投资分析系统 - 核心逻辑文档

> 本文档提取了项目的核心功能、逻辑和 Prompt 词，用于 AI 编程重现。

---

## 一、系统概述

### 功能定位
基于每日新闻联播内容，使用 AI 分析其对中国资本市场（股票、期货、债券）的投资影响，生成股票推荐排行榜。

### 技术栈
- **前端**: Next.js + React + TypeScript + TailwindCSS
- **AI**: 阿里云千问大模型 (qwen-max)
- **数据抓取**: Cheerio + Axios + Crawlbase API
- **定时任务**: GitHub Actions
- **部署**: Netlify / Vercel

---

## 二、核心数据结构

### 1. 新闻条目 (NewsItem)
```typescript
interface NewsItem {
  id: string;           // 格式: "YYYY-MM-DD-序号"
  date: string;         // 日期: "YYYY-MM-DD"
  title: string;        // 新闻标题
  content: string;      // 新闻内容
  category?: string;    // 分类（可选）
  sourceUrl?: string;   // 来源URL
  scrapedAt: string;    // 抓取时间 ISO格式
}
```

### 2. 行业影响分析 (IndustryImpact)
```typescript
interface IndustryImpact {
  industryName: string;                           // 行业名称
  impactScore: number;                            // 影响评分 0-100
  impactType: 'positive' | 'negative' | 'neutral'; // 影响类型
  reasoning: string;                              // 分析原因
  keywords: string[];                             // 相关关键词
  confidence: number;                             // 置信度 0-1
}
```

### 3. 上市公司影响分析 (CompanyImpact)
```typescript
interface CompanyImpact {
  companyName: string;                            // 公司名称
  stockCode: string;                              // 股票代码
  exchange: 'SSE' | 'SZSE' | 'HKEX' | 'OTHER';   // 交易所
  impactScore: number;                            // 影响评分 0-100
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;                              // 分析原因
  relatedIndustries: string[];                    // 相关行业
  confidence: number;                             // 置信度 0-1
  estimatedPriceImpact?: string;                  // 预估价格影响 如 "+3-5%"
}
```

### 4. 期货影响分析 (FuturesImpact)
```typescript
interface FuturesImpact {
  commodity: string;                              // 商品名称
  exchange: string;                               // 交易所：上期所/大商所/郑商所/上能源/广期所
  impactScore: number;                            // 影响评分 0-100
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  priceDirection?: 'up' | 'down' | 'stable';      // 价格走向
  confidence: number;
}
```

### 5. 债券影响分析 (BondImpact)
```typescript
interface BondImpact {
  bondType: string;                               // 债券类型：国债/企业债/地方债
  impactScore: number;
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  yieldDirection?: 'up' | 'down' | 'stable';      // 收益率走向
  riskLevel?: 'low' | 'medium' | 'high';          // 风险等级
  confidence: number;
}
```

### 6. 综合投资分析 (InvestmentAnalysis)
```typescript
interface InvestmentAnalysis {
  newsId: string;
  newsDate: string;
  newsTitle: string;
  newsContent: string;
  
  // 各类影响分析
  industryImpacts: IndustryImpact[];
  companyImpacts: CompanyImpact[];
  futuresImpacts: FuturesImpact[];
  bondImpacts: BondImpact[];
  
  // 综合评估
  overallSentiment: 'bullish' | 'bearish' | 'neutral';  // 整体市场情绪
  investmentOpportunityScore: number;                    // 投资机会评分 0-100
  summary: string;                                       // 简要总结
  
  // 元数据
  analyzedAt: string;
  modelVersion?: string;
}
```

### 7. 股票推荐等级
```typescript
type RecommendationLevel = 'strong_buy' | 'buy' | 'neutral' | 'not_recommended';

// 评分规则
// >= 85: strong_buy (强烈推荐)
// >= 75: buy (推荐)
// >= 50: neutral (中性)
// < 50: not_recommended (不推荐)
```

---

## 三、核心流程

### 整体流程
```
1. 抓取新闻 → 2. AI分析 → 3. 存储数据 → 4. 生成排行榜 → 5. 前端展示
```

### 定时任务流程 (每天北京时间 21:00)
```
GitHub Actions 触发
    ↓
运行 scrape-news.ts (抓取当天新闻)
    ↓
运行 analyze-news.ts (AI分析每条新闻)
    ↓
保存到 data/news/ 和 data/analysis/ 目录
    ↓
自动提交到 GitHub
    ↓
Netlify 自动重新部署
```

---

## 四、核心模块实现

### 1. 新闻抓取模块 (scraper.ts)

**数据源**: `https://cn.govopendata.com/xinwenlianbo/{YYYYMMDD}`

**抓取逻辑**:
```typescript
async function scrapeNewsData(date?: string): Promise<NewsItem[]> {
  // 1. 构建URL: https://cn.govopendata.com/xinwenlianbo/20251204
  const url = `${BASE_URL}/${date.replace(/-/g, '')}`;
  
  // 2. 使用 Crawlbase API 绕过 Cloudflare (可选)
  // 或直接请求
  
  // 3. 使用 Cheerio 解析 HTML
  const $ = cheerio.load(response.data);
  
  // 4. 提取新闻条目
  // 选择器: '.news-item, .list-item, article'
  // 标题: '.title, h2, h3'
  // 内容: '.content, .description, p'
  
  // 5. 返回 NewsItem[] 数组
}
```

### 2. AI分析模块 (analyzer.ts)

**API配置**:
```typescript
// 使用阿里云千问大模型
const openai = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 模型选择
model: 'qwen-max'  // 最强模型
// 或 'qwen-plus'  // 平衡
// 或 'qwen-turbo' // 快速
```

**分析逻辑**:
```typescript
async function analyzeNewsImpact(news: NewsItem): Promise<InvestmentAnalysis> {
  // 1. 构建 Prompt (见下方完整 Prompt)
  // 2. 调用千问 API
  // 3. 解析 JSON 响应
  // 4. 返回 InvestmentAnalysis 对象
}

// 批量分析（每条间隔2秒避免限流）
async function analyzeMultipleNews(newsList: NewsItem[]): Promise<InvestmentAnalysis[]> {
  for (const news of newsList) {
    const analysis = await analyzeNewsImpact(news);
    await sleep(2000); // 避免 API 限流
  }
}
```

### 3. 股票排行榜模块 (stock-ranking.ts)

**排名逻辑**:
```typescript
function generateDailyStockRanking(date: string, analyses: InvestmentAnalysis[]): DailyStockRanking {
  // 1. 合并所有分析中的公司影响
  // 2. 去重（同一股票取最高分）
  // 3. 按分数降序排序
  // 4. 根据分数划分推荐等级
  //    >= 85: 强烈推荐
  //    >= 75: 推荐
  //    >= 50: 中性
  //    < 50: 不推荐
}
```

### 4. 存储模块 (local-storage.ts)

**文件结构**:
```
data/
├── news/
│   ├── 2025-12-04-0.json
│   ├── 2025-12-04-1.json
│   └── ...
└── analysis/
    ├── 2025-12-04-0.json
    ├── 2025-12-04-1.json
    └── ...
```

---

## 五、核心 Prompt 词

### 投资分析 Prompt (完整版)

```
作为一名资深的投资分析师，请分析以下新闻联播内容对中国资本市场的投资影响：

日期：${news.date}
标题：${news.title}
内容：${news.content}

请从以下四个维度进行详细分析，并以 JSON 格式返回结果：

1. **行业影响** (industryImpacts)：
   - 识别受影响的行业（如：新能源、半导体、医药、房地产、消费等）
   - 每个行业给出影响评分 (0-100)、影响类型 (positive/negative/neutral)、详细分析原因、相关关键词、置信度 (0-1)

2. **上市公司影响** (companyImpacts)：
   - 识别可能受影响的具体上市公司
   - 给出公司名称、股票代码、交易所、影响评分、影响类型、分析原因、相关行业、置信度、预估价格影响

3. **期货商品影响** (futuresImpacts)：
   - 识别受影响的期货商品（如：原油、黄金、铜、钢铁、农产品等）
   - 给出商品名称、交易所（上期所/大商所/郑商所/上能源/广期所）、影响评分、影响类型、分析原因、价格走向预测、置信度

4. **债券市场影响** (bondImpacts)：
   - 分析对债券市场的影响（国债、企业债、地方债等）
   - 给出债券类型、影响评分、影响类型、分析原因、收益率走向预测、风险等级、置信度

5. **综合评估**：
   - overallSentiment: 整体市场情绪 (bullish/bearish/neutral)
   - investmentOpportunityScore: 投资机会评分 (0-100)
   - summary: 简要总结 (100字以内)

返回格式示例：
{
  "industryImpacts": [
    {
      "industryName": "新能源",
      "impactScore": 85,
      "impactType": "positive",
      "reasoning": "政策支持新能源发展...",
      "keywords": ["政策", "补贴", "发展"],
      "confidence": 0.9
    }
  ],
  "companyImpacts": [
    {
      "companyName": "宁德时代",
      "stockCode": "300750",
      "exchange": "SZSE",
      "impactScore": 80,
      "impactType": "positive",
      "reasoning": "新能源政策利好电池企业",
      "relatedIndustries": ["新能源", "汽车"],
      "confidence": 0.85,
      "estimatedPriceImpact": "+3-5%"
    }
  ],
  "futuresImpacts": [
    {
      "commodity": "原油",
      "exchange": "上期所",
      "impactScore": 70,
      "impactType": "positive",
      "reasoning": "需求增长预期",
      "priceDirection": "up",
      "confidence": 0.75
    }
  ],
  "bondImpacts": [
    {
      "bondType": "国债",
      "impactScore": 60,
      "impactType": "neutral",
      "reasoning": "货币政策保持稳定",
      "yieldDirection": "stable",
      "riskLevel": "low",
      "confidence": 0.8
    }
  ],
  "overallSentiment": "bullish",
  "investmentOpportunityScore": 75,
  "summary": "政策利好新能源行业，相关企业和商品期货有望受益，建议关注龙头企业。"
}

**重要要求**：
1. 必须直接返回纯 JSON 格式，不要添加任何说明文字
2. 不要使用 markdown 代码块包裹
3. 直接以 { 开始，以 } 结束
4. 确保所有字段完整，如果某个维度没有明显影响，返回空数组 []
```

### System Prompt

```
你是一名专业的投资分析师，擅长分析新闻对股票、期货、债券市场的影响。请以专业、客观的角度进行分析。
```

### API 调用参数

```typescript
{
  model: 'qwen-max',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  temperature: 0.3  // 低温度保证输出稳定性
}
```

---

## 六、定时任务配置

### GitHub Actions 配置

```yaml
name: 每日新闻分析更新

on:
  schedule:
    - cron: '0 13 * * *'  # UTC 13:00 = 北京时间 21:00
  workflow_dispatch:       # 支持手动触发

jobs:
  update-news-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx tsx scripts/scrape-news.ts $(TZ='Asia/Shanghai' date +'%Y-%m-%d')
        env:
          CRAWLBASE_TOKEN: ${{ secrets.CRAWLBASE_TOKEN }}
      - run: npx tsx scripts/analyze-news.ts $(TZ='Asia/Shanghai' date +'%Y-%m-%d')
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
      - run: |
          git config user.email "action@github.com"
          git config user.name "GitHub Action"
          git add data/
          git commit -m "🤖 自动更新: $(date +'%Y-%m-%d') 新闻分析数据"
          git push
```

---

## 七、环境变量

```env
# 必需
QWEN_API_KEY=sk-xxx                    # 阿里云千问 API Key

# 可选（用于绕过 Cloudflare）
CRAWLBASE_TOKEN=xxx                    # Crawlbase API Token

# Vercel KV（如果使用 Vercel 部署）
KV_REST_API_URL=xxx
KV_REST_API_TOKEN=xxx
```

---

## 八、API 接口

### 获取新闻列表
```
GET /api/news?date=2025-12-04
```

### 获取分析结果
```
GET /api/analysis?date=2025-12-04
```

### 获取股票排行榜
```
GET /api/stock-ranking?date=2025-12-04
```

### 手动触发抓取和分析
```
POST /api/cron/daily-update
```

---

## 九、重现步骤

1. **创建 Next.js 项目**
   ```bash
   npx create-next-app@latest --typescript --tailwind
   ```

2. **安装依赖**
   ```bash
   npm install openai axios cheerio
   ```

3. **实现核心模块**
   - `lib/scraper.ts` - 新闻抓取
   - `lib/analyzer.ts` - AI 分析
   - `lib/storage.ts` - 数据存储
   - `lib/stock-ranking.ts` - 排行榜生成

4. **创建 API 路由**
   - `app/api/news/route.ts`
   - `app/api/analysis/route.ts`
   - `app/api/stock-ranking/route.ts`
   - `app/api/cron/daily-update/route.ts`

5. **配置定时任务**
   - `.github/workflows/daily-update.yml`

6. **部署**
   - Netlify 或 Vercel
   - 配置环境变量

---

## 十、注意事项

1. **API 费用**: 千问 API 按调用量收费，每天约 ¥1-2
2. **抓取限制**: 使用 Crawlbase 可绕过 Cloudflare 防护
3. **数据存储**: 本地使用文件存储，生产环境可用 Vercel KV
4. **错误处理**: AI 返回可能包含 markdown 代码块，需要清理后解析 JSON
5. **限流**: 批量分析时每条间隔 2 秒，避免 API 限流
