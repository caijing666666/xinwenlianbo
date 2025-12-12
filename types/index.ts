// 新闻条目
export interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  category?: string;
  duration?: number;
  sourceUrl?: string;
  scrapedAt: string;
}

// 行业影响分析
export interface IndustryImpact {
  industryName: string;
  industryCode?: string;
  impactScore: number; // 0-100
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  keywords: string[];
  confidence: number; // 0-1
}

// 上市公司影响分析
export interface CompanyImpact {
  companyName: string;
  stockCode: string;
  exchange: 'SSE' | 'SZSE' | 'HKEX' | 'OTHER'; // 上交所、深交所、港交所
  impactScore: number; // 0-100
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  relatedIndustries: string[];
  confidence: number;
  estimatedPriceImpact?: string; // e.g., "+3-5%", "-2-4%"
}

// 期货影响分析
export interface FuturesImpact {
  commodity: string; // 商品名称
  commodityCode?: string;
  exchange: string; // 交易所：上期所、大商所、郑商所、上能源、广期所
  impactScore: number;
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  priceDirection?: 'up' | 'down' | 'stable';
  confidence: number;
}

// 债券市场影响分析
export interface BondImpact {
  bondType: string; // 国债、企业债、地方债等
  impactScore: number;
  impactType: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  yieldDirection?: 'up' | 'down' | 'stable';
  riskLevel?: 'low' | 'medium' | 'high';
  confidence: number;
}

// 综合投资分析
export interface InvestmentAnalysis {
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
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  investmentOpportunityScore: number; // 0-100
  summary: string;
  
  // 元数据
  analyzedAt: string;
  modelVersion?: string;
}

// 分析结果汇总（用于展示）
export interface AnalysisSummary {
  date: string;
  totalNewsCount: number;
  topIndustries: IndustryImpact[];
  topCompanies: CompanyImpact[];
  topFutures: FuturesImpact[];
  bondMarketOutlook: BondImpact[];
  overallMarketSentiment: 'bullish' | 'bearish' | 'neutral';
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 股票推荐等级
export type RecommendationLevel = 'strong_buy' | 'buy' | 'neutral' | 'not_recommended';

// 带推荐等级的股票
export interface RankedStock extends CompanyImpact {
  rank: number;  // 排名（从1开始）
  recommendationLevel: RecommendationLevel;
  recommendationLabel: string;  // 中文标签
}

// 每日股票排行榜
export interface DailyStockRanking {
  date: string;
  totalStocks: number;
  strongBuy: RankedStock[];    // 强烈推荐 (>=85)
  buy: RankedStock[];          // 推荐 (75-84)
  neutral: RankedStock[];      // 中性 (50-74)
  notRecommended: RankedStock[]; // 不推荐 (<50)
  updatedAt: string;
}
