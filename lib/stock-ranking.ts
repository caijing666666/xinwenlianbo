import { 
  InvestmentAnalysis, 
  CompanyImpact, 
  RankedStock, 
  DailyStockRanking,
  RecommendationLevel 
} from '@/types';

/**
 * 根据分数获取推荐等级
 */
export function getRecommendationLevel(score: number): RecommendationLevel {
  if (score >= 85) return 'strong_buy';
  if (score >= 75) return 'buy';
  if (score >= 50) return 'neutral';
  return 'not_recommended';
}

/**
 * 获取推荐等级的中文标签
 */
export function getRecommendationLabel(level: RecommendationLevel): string {
  const labels: Record<RecommendationLevel, string> = {
    'strong_buy': '强烈推荐',
    'buy': '推荐',
    'neutral': '中性',
    'not_recommended': '不推荐'
  };
  return labels[level];
}

/**
 * 获取推荐等级的颜色
 */
export function getRecommendationColor(level: RecommendationLevel): string {
  const colors: Record<RecommendationLevel, string> = {
    'strong_buy': '#dc2626',    // 红色（强烈看涨）
    'buy': '#ea580c',           // 橙色
    'neutral': '#6b7280',       // 灰色
    'not_recommended': '#16a34a' // 绿色（看跌）
  };
  return colors[level];
}

/**
 * 获取推荐等级的背景色
 */
export function getRecommendationBgColor(level: RecommendationLevel): string {
  const colors: Record<RecommendationLevel, string> = {
    'strong_buy': 'bg-red-100 border-red-300',
    'buy': 'bg-orange-100 border-orange-300',
    'neutral': 'bg-gray-100 border-gray-300',
    'not_recommended': 'bg-green-100 border-green-300'
  };
  return colors[level];
}

/**
 * 合并并去重股票（同一只股票可能在多条新闻中出现）
 * 取最高分作为该股票的最终得分
 */
function mergeAndDeduplicateStocks(analyses: InvestmentAnalysis[]): CompanyImpact[] {
  const stockMap = new Map<string, CompanyImpact>();
  
  for (const analysis of analyses) {
    for (const company of analysis.companyImpacts) {
      const key = company.stockCode || company.companyName;
      const existing = stockMap.get(key);
      
      if (!existing || company.impactScore > existing.impactScore) {
        stockMap.set(key, company);
      }
    }
  }
  
  return Array.from(stockMap.values());
}

/**
 * 生成每日股票排行榜
 */
export function generateDailyStockRanking(
  date: string, 
  analyses: InvestmentAnalysis[]
): DailyStockRanking {
  // 合并去重
  const allStocks = mergeAndDeduplicateStocks(analyses);
  
  // 按分数降序排序
  const sortedStocks = allStocks.sort((a, b) => b.impactScore - a.impactScore);
  
  // 添加排名和推荐等级
  const rankedStocks: RankedStock[] = sortedStocks.map((stock, index) => {
    const level = getRecommendationLevel(stock.impactScore);
    return {
      ...stock,
      rank: index + 1,
      recommendationLevel: level,
      recommendationLabel: getRecommendationLabel(level)
    };
  });
  
  // 按等级分组
  const strongBuy = rankedStocks.filter(s => s.recommendationLevel === 'strong_buy');
  const buy = rankedStocks.filter(s => s.recommendationLevel === 'buy');
  const neutral = rankedStocks.filter(s => s.recommendationLevel === 'neutral');
  const notRecommended = rankedStocks.filter(s => s.recommendationLevel === 'not_recommended');
  
  return {
    date,
    totalStocks: rankedStocks.length,
    strongBuy,
    buy,
    neutral,
    notRecommended,
    updatedAt: new Date().toISOString()
  };
}

/**
 * 获取排行榜统计信息
 */
export function getRankingStats(ranking: DailyStockRanking) {
  return {
    total: ranking.totalStocks,
    strongBuyCount: ranking.strongBuy.length,
    buyCount: ranking.buy.length,
    neutralCount: ranking.neutral.length,
    notRecommendedCount: ranking.notRecommended.length,
    strongBuyPercent: ranking.totalStocks > 0 
      ? Math.round(ranking.strongBuy.length / ranking.totalStocks * 100) 
      : 0,
    buyPercent: ranking.totalStocks > 0 
      ? Math.round(ranking.buy.length / ranking.totalStocks * 100) 
      : 0
  };
}
