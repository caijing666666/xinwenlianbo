'use client';

import React, { useState, useEffect } from 'react';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestmentAnalysis, ApiResponse, NewsItem } from '@/types';
import { Loader2, AlertCircle, Newspaper, Download, Brain, RefreshCw, Clock, Tv, Calendar, TrendingUp, List } from 'lucide-react';
import Link from 'next/link';
import StockRanking from '@/components/StockRanking';

// 客户端时间显示组件，避免SSR/CSR时间不一致的hydration错误
function ClientTimeDisplay({ currentTime }: { currentTime: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取新闻联播开始时间倒计时
  const getCountdownToNews = () => {
    const newsTime = new Date(currentTime);
    newsTime.setHours(19, 0, 0, 0); // 设置为19:00
    
    if (currentTime < newsTime) {
      const diff = newsTime.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}小时${minutes}分钟`;
    }
    return null;
  };

  // 服务端渲染时不显示时间，避免hydration错误
  if (!mounted) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>当前时间: --:--</span>
        </div>
        <div className="text-orange-600 font-medium">
          距离开播: 计算中...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <Clock className="w-4 h-4" />
        <span>当前时间: {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="text-orange-600 font-medium">
        距离开播: {getCountdownToNews()}
      </div>
    </div>
  );
}

// 客户端倒计时组件，避免SSR/CSR时间不一致的hydration错误
function ClientCountdown({ currentTime }: { currentTime: Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取新闻联播开始时间倒计时
  const getCountdownToNews = () => {
    const newsTime = new Date(currentTime);
    newsTime.setHours(19, 0, 0, 0); // 设置为19:00
    
    if (currentTime < newsTime) {
      const diff = newsTime.getTime() - currentTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}小时${minutes}分钟`;
    }
    return null;
  };

  // 服务端渲染时不显示时间，避免hydration错误
  if (!mounted) {
    return <span className="font-semibold text-orange-600">计算中...</span>;
  }

  return <span className="font-semibold text-orange-600">{getCountdownToNews()}</span>;
}

export default function Home() {
  const [analyses, setAnalyses] = useState<InvestmentAnalysis[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
  // 默认显示今天的数据
  const getDefaultDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [viewMode, setViewMode] = useState<'ranking' | 'detail'>('ranking'); // 默认显示排行榜

  // 检查是否是今天且新闻联播还未开始
  const isWaitingForTodayNews = () => {
    const todayStr = currentTime.toISOString().split('T')[0];
    const currentHour = currentTime.getHours();
    
    // 如果选择的是今天，且当前时间在19:00之前
    return selectedDate === todayStr && currentHour < 19;
  };

  // 检查是否是今天且新闻联播已经结束但还没有数据
  const isWaitingForData = () => {
    const todayStr = currentTime.toISOString().split('T')[0];
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // 如果选择的是今天，且当前时间在19:30之后但在23:59之前
    return selectedDate === todayStr && 
           ((currentHour === 19 && currentMinute >= 30) || currentHour > 19) && 
           analyses.length === 0;
  };

  useEffect(() => {
    loadNews();
    loadAnalyses();
  }, [selectedDate]);

  // 每分钟更新一次时间，用于倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 加载新闻数据
  const loadNews = async () => {
    try {
      const response = await fetch(`/api/news?date=${selectedDate}`);
      const data: ApiResponse<NewsItem[]> = await response.json();

      if (data.success && data.data) {
        setNews(data.data);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('加载新闻失败:', err);
      setNews([]);
    }
  };

  // 加载分析数据
  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching analysis for date:', selectedDate);
      const response = await fetch(`/api/analysis?date=${selectedDate}`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data: ApiResponse<InvestmentAnalysis[]>;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      if (data.success && data.data) {
        // 按照投资机会评分从高到低排序
        const sortedAnalyses = data.data.sort((a, b) => 
          (b.investmentOpportunityScore || 0) - (a.investmentOpportunityScore || 0)
        );
        setAnalyses(sortedAnalyses);
      } else {
        setAnalyses([]);
        if (!data.success) {
          setError(data.error || '未知错误');
        }
      }
    } catch (err) {
      console.error('Load analyses error:', err);
      setError(err instanceof Error ? err.message : '加载失败');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 新闻联播状态栏 */}
          {isWaitingForTodayNews() && (
            <div className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">新闻联播状态</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    等待开播
                  </div>
                </div>
                <ClientTimeDisplay currentTime={currentTime} />
              </div>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-lg">
                <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  新闻联播投资分析系统
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  基于 AI 的每日新闻联播投资机会追踪与分析
                </p>
              </div>
            </div>
            
            {/* 移动端优化的控制区域 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* 日期选择器 */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* 按钮组 */}
              <div className="flex gap-2">
                <Link
                  href="/monthly"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">月度总览</span>
                  <span className="sm:hidden">总览</span>
                </Link>
                                <button
                  onClick={loadAnalyses}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="sr-only">刷新</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">正在加载分析数据...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={loadAnalyses}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新加载
                </button>
              </div>
            </CardContent>
          </Card>
        ) : analyses.length > 0 ? (
          // 显示分析结果
          <div className="space-y-4 sm:space-y-6">
            {/* 视图切换按钮 */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
              <button
                onClick={() => setViewMode('ranking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'ranking' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                股票排行榜
              </button>
              <button
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'detail' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                新闻详情
              </button>
            </div>

            {/* 根据视图模式显示不同内容 */}
            {viewMode === 'ranking' ? (
              <Card>
                <CardContent className="pt-6">
                  <StockRanking date={selectedDate} />
                </CardContent>
              </Card>
            ) : (
            /* 新闻详情视图 */
            analyses.map((analysis, index) => (
              <Card key={analysis.newsId} className={`overflow-hidden ${
                analysis.investmentOpportunityScore >= 80 ? 'border-2 border-red-200 shadow-lg' : 
                analysis.investmentOpportunityScore >= 70 ? 'border-2 border-orange-200 shadow-md' : ''
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg leading-tight">
                    {analysis.newsTitle}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    投资机会评分: <span className={`font-bold text-lg ${
                      analysis.investmentOpportunityScore >= 80 ? 'text-red-600' : 
                      analysis.investmentOpportunityScore >= 70 ? 'text-orange-600' : 
                      analysis.investmentOpportunityScore >= 60 ? 'text-blue-600' : 'text-gray-600'
                    }`}>{analysis.investmentOpportunityScore}/100</span>
                    {analysis.investmentOpportunityScore >= 80 && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">
                        🔥 高价值
                      </span>
                    )}
                    {analysis.investmentOpportunityScore >= 70 && analysis.investmentOpportunityScore < 80 && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-semibold">
                        ⭐ 重点关注
                      </span>
                    )}
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {analysis.overallSentiment === 'bullish' ? '看涨' : analysis.overallSentiment === 'bearish' ? '看跌' : '中性'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 移动端优化的影响分析 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 行业影响 */}
                    {analysis.industryImpacts && analysis.industryImpacts.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-900 text-sm mb-2">🏭 行业影响</h4>
                        <div className="space-y-2">
                          {analysis.industryImpacts.slice(0, 2).map((impact, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{impact.industryName}</span>
                                <span className="text-blue-600 font-semibold">{impact.impactScore}</span>
                              </div>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{impact.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 公司影响 */}
                    {analysis.companyImpacts && analysis.companyImpacts.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-900 text-sm mb-2">🏢 公司影响</h4>
                        <div className="space-y-2">
                          {analysis.companyImpacts.slice(0, 2).map((impact, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{impact.companyName}</span>
                                <span className="text-green-600 font-semibold">{impact.impactScore}</span>
                              </div>
                              <div className="text-xs text-gray-500">{impact.stockCode}</div>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{impact.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 总结 */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">📊 分析总结</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
        ) : analyses.length === 0 ? (
          // 检查是否有新闻数据
          news.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  已抓取新闻 ({news.length} 条)
                </CardTitle>
                <CardDescription>
                  {selectedDate} 的新闻数据已准备就绪，点击&quot;AI 分析&quot;开始投资分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 新闻列表 */}
                  <div className="space-y-3">
                    {news.map((item, index) => (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 flex-1 pr-4">
                            {index + 1}. {item.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(item.scrapedAt).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
            <CardHeader>
              {isWaitingForTodayNews() ? (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    等待今日新闻联播
                  </CardTitle>
                  <CardDescription>
                    今日新闻联播尚未开始，预计还有 <ClientCountdown currentTime={currentTime} /> 开播
                  </CardDescription>
                </>
              ) : isWaitingForData() ? (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    新闻联播已结束，等待数据更新
                  </CardTitle>
                  <CardDescription>
                    今日新闻联播已播出完毕，数据正在处理中，请稍后刷新页面或手动抓取数据
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle>暂无数据</CardTitle>
                  <CardDescription>
                    该日期暂无分析数据。请选择其他日期或运行数据抓取和分析任务。
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isWaitingForTodayNews() ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">📺 新闻联播时间表</h3>
                    <div className="text-sm text-orange-800 space-y-1">
                      <p>• <strong>播出时间：</strong>每晚 19:00 - 19:30</p>
                      <p>• <strong>数据更新：</strong>播出结束后约 30 分钟</p>
                      <p>• <strong>分析完成：</strong>数据抓取后 5-10 分钟</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 您可以：</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      <li>查看历史数据（选择其他日期）</li>
                      <li>设置提醒，19:30 后回来查看</li>
                      <li>了解系统功能和使用方法</li>
                    </ul>
                  </div>
                </div>
              ) : isWaitingForData() ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">🔄 数据处理中</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>新闻联播已播出完毕，系统正在处理今日数据：</p>
                      <div className="ml-4 space-y-1">
                        <p>• 数据源更新：通常在播出后 10-30 分钟</p>
                        <p>• 自动抓取：每小时检查一次</p>
                        <p>• AI 分析：抓取完成后自动开始</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">📊 数据预抓取系统</h3>
                    <p className="text-sm text-blue-800">
                      本系统采用预抓取模式，所有数据已事先准备。数据会定期自动更新，确保内容的时效性。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 预抓取系统说明：</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>本系统采用预抓取模式，最近30天的新闻和分析数据已事先准备：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>选择日期即可查看对应的分析结果</li>
                      <li>所有数据已完成AI分析，无需等待</li>
                      <li>数据会定期自动更新，确保内容时效性</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )
        ) : (
          <AnalysisDashboard analyses={analyses} date={selectedDate} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            新闻联播投资分析系统 | 数据来源：
            <a
              href="https://cn.govopendata.com/xinwenlianbo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              cn.govopendata.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
