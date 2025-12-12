'use client';

import { useState, useEffect } from 'react';
import { DailyStockRanking, RankedStock, RecommendationLevel } from '@/types';
import { 
  getRecommendationColor, 
  getRecommendationBgColor,
  getRecommendationLabel 
} from '@/lib/stock-ranking';

interface StockRankingProps {
  date: string;
}

// 推荐等级配置
const levelConfig: Record<RecommendationLevel, { 
  title: string; 
  icon: string; 
  bgClass: string;
  textClass: string;
  borderClass: string;
}> = {
  strong_buy: {
    title: '强烈推荐',
    icon: '🔥',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200'
  },
  buy: {
    title: '推荐',
    icon: '👍',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200'
  },
  neutral: {
    title: '中性',
    icon: '➖',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-200'
  },
  not_recommended: {
    title: '不推荐',
    icon: '⚠️',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200'
  }
};

// 单个股票卡片
function StockCard({ stock, showRank = true }: { stock: RankedStock; showRank?: boolean }) {
  const config = levelConfig[stock.recommendationLevel];
  
  return (
    <div className={`p-4 rounded-lg border ${config.bgClass} ${config.borderClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {showRank && (
              <span className="text-lg font-bold text-gray-400">#{stock.rank}</span>
            )}
            <span className="font-semibold text-gray-900">{stock.companyName}</span>
            <span className="text-sm text-gray-500">({stock.stockCode})</span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {stock.relatedIndustries?.join(' · ') || '未分类'}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${config.textClass}`}>
            {stock.impactScore}
          </div>
          <div className="text-xs text-gray-500">影响分</div>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-700">
        {stock.reasoning}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded ${
            stock.impactType === 'positive' ? 'bg-red-100 text-red-700' :
            stock.impactType === 'negative' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {stock.impactType === 'positive' ? '利好' : 
             stock.impactType === 'negative' ? '利空' : '中性'}
          </span>
          {stock.estimatedPriceImpact && (
            <span className="text-gray-500">
              预估: {stock.estimatedPriceImpact}
            </span>
          )}
        </div>
        <span className="text-gray-400">
          置信度: {Math.round(stock.confidence * 100)}%
        </span>
      </div>
    </div>
  );
}

// 分组展示
function StockGroup({ 
  level, 
  stocks 
}: { 
  level: RecommendationLevel; 
  stocks: RankedStock[] 
}) {
  const config = levelConfig[level];
  
  if (stocks.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${config.borderClass}`}>
        <span className="text-xl">{config.icon}</span>
        <h3 className={`text-lg font-semibold ${config.textClass}`}>
          {config.title}
        </h3>
        <span className="text-sm text-gray-500">
          ({stocks.length} 只)
        </span>
        <span className="text-xs text-gray-400 ml-2">
          {level === 'strong_buy' && '≥85分'}
          {level === 'buy' && '75-84分'}
          {level === 'neutral' && '50-74分'}
          {level === 'not_recommended' && '<50分'}
        </span>
      </div>
      <div className="grid gap-3">
        {stocks.map((stock) => (
          <StockCard key={`${stock.stockCode}-${stock.rank}`} stock={stock} />
        ))}
      </div>
    </div>
  );
}

// 统计概览
function RankingStats({ 
  ranking, 
  stats 
}: { 
  ranking: DailyStockRanking; 
  stats: {
    total: number;
    strongBuyCount: number;
    buyCount: number;
    neutralCount: number;
    notRecommendedCount: number;
  }
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div className="bg-white p-4 rounded-lg border text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-xs text-gray-500">总股票数</div>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
        <div className="text-2xl font-bold text-red-700">{stats.strongBuyCount}</div>
        <div className="text-xs text-red-600">强烈推荐</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
        <div className="text-2xl font-bold text-orange-700">{stats.buyCount}</div>
        <div className="text-xs text-orange-600">推荐</div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-gray-700">{stats.neutralCount}</div>
        <div className="text-xs text-gray-600">中性</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
        <div className="text-2xl font-bold text-green-700">{stats.notRecommendedCount}</div>
        <div className="text-xs text-green-600">不推荐</div>
      </div>
    </div>
  );
}

export default function StockRanking({ date }: StockRankingProps) {
  const [ranking, setRanking] = useState<DailyStockRanking | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/stock-ranking?date=${date}`);
        const data = await res.json();
        
        if (data.success) {
          setRanking(data.data.ranking);
          setStats(data.data.stats);
        } else {
          setError(data.error || '获取数据失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
    
    if (date) {
      fetchRanking();
    }
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载股票排行榜...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  if (!ranking || ranking.totalStocks === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📭</div>
        <div className="text-gray-600">{date} 暂无股票推荐数据</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          📈 {date} 股票推荐排行榜
        </h2>
        <span className="text-sm text-gray-500">
          更新于 {new Date(ranking.updatedAt).toLocaleString('zh-CN')}
        </span>
      </div>
      
      <RankingStats ranking={ranking} stats={stats} />
      
      <StockGroup level="strong_buy" stocks={ranking.strongBuy} />
      <StockGroup level="buy" stocks={ranking.buy} />
      <StockGroup level="neutral" stocks={ranking.neutral} />
      <StockGroup level="not_recommended" stocks={ranking.notRecommended} />
    </div>
  );
}
