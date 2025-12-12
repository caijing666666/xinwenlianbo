'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsItem, InvestmentAnalysis } from '@/types';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Factory, 
  Coins, 
  CreditCard,
  BarChart3,
  ArrowLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface DailyData {
  date: string;
  news: NewsItem[];
  analyses: InvestmentAnalysis[];
}

interface MonthlyStatistics {
  sentimentCounts: { bullish: number; bearish: number; neutral: number };
  topIndustries: Array<{ name: string; count: number; avgScore: number }>;
  topCompanies: Array<{ name: string; count: number; avgScore: number; stockCode: string }>;
  topFutures: Array<{ name: string; count: number; avgScore: number }>;
  topBonds: Array<{ name: string; count: number; avgScore: number }>;
  totalAnalyses: number;
}

interface MonthlyData {
  dailyData: DailyData[];
  statistics: MonthlyStatistics;
  totalDays: number;
  newsCount: number;
  analysisCount: number;
}

export default function MonthlyPage() {
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    loadMonthlyData();
  }, [selectedDays]);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monthly?days=${selectedDays}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '加载失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getImpactColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    if (score >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载月度数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadMonthlyData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重新加载
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回首页
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    月度数据总览
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    过去 {data.totalDays} 天的新闻联播投资分析汇总
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>过去7天</option>
                <option value={15}>过去15天</option>
                <option value={30}>过去30天</option>
                <option value={60}>过去60天</option>
                <option value={90}>过去90天</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">总新闻数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{data.newsCount}</div>
              <p className="text-xs text-gray-500 mt-1">过去 {data.totalDays} 天</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">分析报告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{data.analysisCount}</div>
              <p className="text-xs text-gray-500 mt-1">AI 分析完成</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">市场情绪</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">看涨</span>
                  <span className="font-medium">{data.statistics.sentimentCounts.bullish}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">看跌</span>
                  <span className="font-medium">{data.statistics.sentimentCounts.bearish}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">中性</span>
                  <span className="font-medium">{data.statistics.sentimentCounts.neutral}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">活跃天数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.dailyData.filter(day => day.analyses.length > 0).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">有分析数据的天数</p>
            </CardContent>
          </Card>
        </div>

        {/* 热门统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 热门行业 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-600" />
                热门行业
              </CardTitle>
              <CardDescription>按平均影响分数排序</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statistics.topIndustries.slice(0, 8).map((industry, index) => (
                  <div key={industry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="font-medium">{industry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">({industry.count}次)</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(industry.avgScore)}`}>
                        {industry.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热门公司 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                热门公司
              </CardTitle>
              <CardDescription>按平均影响分数排序</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statistics.topCompanies.slice(0, 8).map((company, index) => (
                  <div key={company.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <div>
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({company.stockCode})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">({company.count}次)</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(company.avgScore)}`}>
                        {company.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 期货和债券 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 热门期货 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                热门期货
              </CardTitle>
              <CardDescription>商品期货影响分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statistics.topFutures.slice(0, 6).map((future, index) => (
                  <div key={future.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="font-medium">{future.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">({future.count}次)</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(future.avgScore)}`}>
                        {future.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 债券市场 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                债券市场
              </CardTitle>
              <CardDescription>债券类型影响分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.statistics.topBonds.map((bond, index) => (
                  <div key={bond.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="font-medium">{bond.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">({bond.count}次)</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(bond.avgScore)}`}>
                        {bond.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 每日详情 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              每日详情
            </CardTitle>
            <CardDescription>点击展开查看每日新闻和分析详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dailyData.map((dayData) => (
                <div key={dayData.date} className="border rounded-lg">
                  <button
                    onClick={() => toggleDayExpansion(dayData.date)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="font-medium">{formatDate(dayData.date)}</div>
                        <div className="text-sm text-gray-500">
                          {dayData.news.length} 条新闻 • {dayData.analyses.length} 个分析
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dayData.analyses.length > 0 && (
                        <div className="flex gap-1">
                          {dayData.analyses.map((analysis, idx) => (
                            <div
                              key={idx}
                              className={`w-3 h-3 rounded-full ${
                                analysis.overallSentiment === 'bullish' ? 'bg-green-500' :
                                analysis.overallSentiment === 'bearish' ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {expandedDays.has(dayData.date) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDays.has(dayData.date) && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="mt-4 space-y-4">
                        {/* 新闻列表 */}
                        {dayData.news.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">📰 新闻内容</h4>
                            <div className="space-y-2">
                              {dayData.news.map((news) => (
                                <div key={news.id} className="bg-white p-3 rounded border">
                                  <h5 className="font-medium text-sm mb-1">{news.title}</h5>
                                  <p className="text-xs text-gray-600 line-clamp-2">{news.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 分析结果 */}
                        {dayData.analyses.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">🧠 投资分析</h4>
                            <div className="space-y-3">
                              {dayData.analyses.map((analysis) => (
                                <div key={analysis.newsId} className="bg-white p-3 rounded border">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-sm">{analysis.newsTitle}</h5>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      analysis.overallSentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                                      analysis.overallSentiment === 'bearish' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {analysis.overallSentiment === 'bullish' ? '看涨' :
                                       analysis.overallSentiment === 'bearish' ? '看跌' : '中性'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{analysis.summary}</p>
                                  
                                  {/* 影响概览 */}
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">行业:</span>
                                      <span className="ml-1 font-medium">{analysis.industryImpacts.length}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">公司:</span>
                                      <span className="ml-1 font-medium">{analysis.companyImpacts.length}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">期货:</span>
                                      <span className="ml-1 font-medium">{analysis.futuresImpacts.length}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">债券:</span>
                                      <span className="ml-1 font-medium">{analysis.bondImpacts.length}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
