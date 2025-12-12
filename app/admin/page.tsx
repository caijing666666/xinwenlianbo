'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiResponse } from '@/types';
import { 
  Database, 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Play,
  BarChart3,
  Brain,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface DateStats {
  date: string;
  newsCount: number;
  analysisCount: number;
  hasData: boolean;
  hasAnalysis: boolean;
}

interface DataStats {
  totalDays: number;
  totalNews: number;
  totalAnalyses: number;
  daysWithData: number;
  daysWithAnalysis: number;
  dateList: DateStats[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchScraping, setBatchScraping] = useState(false);
  const [fillAnalyzing, setFillAnalyzing] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<{ current: number; total: number; date: string } | null>(null);
  const [processingDate, setProcessingDate] = useState<string | null>(null); // 正在处理的单个日期

  // 加载数据统计
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data-management');
      const data: ApiResponse<DataStats> = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取最近N天的日期列表
  const getRecentDates = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // 启动批量预抓取 - 逐个日期处理
  const startBatchScrape = async () => {
    try {
      setBatchScraping(true);
      const dates = getRecentDates(30);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        setProgress({ current: i + 1, total: dates.length, date });
        setMessage(`正在处理 ${date} (${i + 1}/${dates.length})...`);

        try {
          const response = await fetch('/api/admin/scrape-day', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
          });

          const data = await response.json();
          if (data.success && data.newsCount > 0) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`处理 ${date} 失败:`, err);
        }

        // 每处理5个日期刷新一次统计
        if ((i + 1) % 5 === 0) {
          await loadStats();
        }
      }

      setMessage(`✅ 批量抓取完成！成功: ${successCount} 天, 跳过/失败: ${failCount} 天`);
      setProgress(null);
      await loadStats();

    } catch (error) {
      setMessage('批量抓取失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setBatchScraping(false);
      setProgress(null);
    }
  };

  // 单日抓取
  const scrapeSingleDay = async (date: string) => {
    try {
      setProcessingDate(date);
      setMessage(`正在抓取 ${date} 的新闻...`);
      
      const response = await fetch('/api/admin/scrape-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✅ ${date} 抓取完成，获取 ${data.newsCount || 0} 条新闻`);
      } else {
        setMessage(`❌ ${date} 抓取失败: ${data.error || '未知错误'}`);
      }
      await loadStats();
    } catch (err) {
      setMessage(`❌ ${date} 抓取失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setProcessingDate(null);
    }
  };

  // 单日分析
  const analyzeSingleDay = async (date: string) => {
    try {
      setProcessingDate(date);
      setMessage(`正在分析 ${date} 的新闻...`);
      
      const response = await fetch('/api/admin/analyze-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✅ ${date} 分析完成，生成 ${data.analysisCount || 0} 条分析`);
      } else {
        setMessage(`❌ ${date} 分析失败: ${data.error || '未知错误'}`);
      }
      await loadStats();
    } catch (err) {
      setMessage(`❌ ${date} 分析失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setProcessingDate(null);
    }
  };

  // 补充分析 - 找出有新闻但没分析的日期
  const startFillAnalysis = async () => {
    if (!stats) return;
    
    // 找出有新闻但没分析的日期
    const needAnalysis = stats.dateList.filter((d: DateStats) => d.hasData && !d.hasAnalysis);
    
    if (needAnalysis.length === 0) {
      setMessage('✅ 所有日期都已有分析，无需补充');
      return;
    }

    try {
      setFillAnalyzing(true);
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < needAnalysis.length; i++) {
        const item = needAnalysis[i];
        setProgress({ current: i + 1, total: needAnalysis.length, date: item.date });
        setMessage(`正在补充分析 ${item.date} (${i + 1}/${needAnalysis.length})...`);

        try {
          const response = await fetch('/api/admin/analyze-day', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: item.date })
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`分析 ${item.date} 失败:`, err);
        }
      }

      setMessage(`✅ 补充分析完成！成功: ${successCount} 天, 失败: ${failCount} 天`);
      setProgress(null);
      await loadStats();

    } catch (error) {
      setMessage('补充分析失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setFillAnalyzing(false);
      setProgress(null);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载数据统计中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">数据管理中心</h1>
                <p className="text-gray-600">新闻联播投资分析系统 - 数据预抓取管理</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/status"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                实时状态
              </Link>
              <button
                onClick={loadStats}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 消息提示 */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* 统计概览 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">总天数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDays}</div>
                <p className="text-xs text-gray-500">最近30天</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">总新闻数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalNews}</div>
                <p className="text-xs text-gray-500">已抓取新闻</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">总分析数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.totalAnalyses}</div>
                <p className="text-xs text-gray-500">AI分析结果</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">完整数据天数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.daysWithAnalysis}</div>
                <p className="text-xs text-gray-500">有新闻+分析</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 批量操作 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              批量预抓取
            </CardTitle>
            <CardDescription>
              一键抓取最近30天的新闻联播数据并进行AI分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={startBatchScrape}
              disabled={batchScraping}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {batchScraping ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {batchScraping ? '正在执行...' : '开始批量预抓取'}
            </button>
            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>进度: {progress.current}/{progress.total}</span>
                  <span>当前: {progress.date}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              注意：此操作会逐个处理最近30天的数据，请保持页面打开
            </p>

            {/* 补充分析按钮 */}
            <div className="mt-6 pt-4 border-t">
              <button
                onClick={startFillAnalysis}
                disabled={fillAnalyzing || batchScraping}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {fillAnalyzing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <BarChart3 className="w-5 h-5" />
                )}
                {fillAnalyzing ? '正在分析...' : '补充缺失分析'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                自动找出有新闻但没分析的日期，补充AI分析
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 日期详情 - 按天查遗补缺 */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                按天查遗补缺 (最近30天)
              </CardTitle>
              <CardDescription>
                点击操作按钮可单独抓取或分析某一天的数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 图例说明 */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" /> 有新闻
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" /> 无新闻
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-purple-500" /> 有分析
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" /> 缺分析
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {stats.dateList.map((item: DateStats) => {
                  const isProcessing = processingDate === item.date;
                  const needsAnalysis = item.hasData && !item.hasAnalysis;
                  const needsScrape = !item.hasData;
                  
                  return (
                    <div
                      key={item.date}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        needsAnalysis 
                          ? 'bg-orange-50 border-orange-200' 
                          : needsScrape 
                            ? 'bg-red-50 border-red-200'
                            : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{item.date}</span>
                        {/* 状态图标 */}
                        <div className="flex items-center gap-1">
                          <span title="有新闻">
                            {item.hasData ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                          <span title={item.hasAnalysis ? "有分析" : item.hasData ? "缺分析" : "无分析"}>
                            {item.hasAnalysis ? (
                              <CheckCircle className="w-4 h-4 text-purple-500" />
                            ) : item.hasData ? (
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-300" />
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* 数量显示 */}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">
                            新闻: <span className="font-medium text-blue-600">{item.newsCount}</span>
                          </span>
                          <span className="text-gray-600">
                            分析: <span className="font-medium text-purple-600">{item.analysisCount}</span>
                          </span>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                          {/* 抓取按钮 */}
                          <button
                            onClick={() => scrapeSingleDay(item.date)}
                            disabled={isProcessing || batchScraping || fillAnalyzing}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                              item.hasData 
                                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={item.hasData ? '重新抓取' : '抓取新闻'}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            抓取
                          </button>
                          
                          {/* 分析按钮 - 只有有新闻时才显示 */}
                          {item.hasData && (
                            <button
                              onClick={() => analyzeSingleDay(item.date)}
                              disabled={isProcessing || batchScraping || fillAnalyzing}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                item.hasAnalysis 
                                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={item.hasAnalysis ? '重新分析' : '补充分析'}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Brain className="w-3 h-3" />
                              )}
                              分析
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 统计摘要 */}
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <div className="flex flex-wrap gap-4">
                  <span>
                    缺新闻: <span className="font-medium text-red-600">
                      {stats.dateList.filter((d: DateStats) => !d.hasData).length}
                    </span> 天
                  </span>
                  <span>
                    缺分析: <span className="font-medium text-orange-600">
                      {stats.dateList.filter((d: DateStats) => d.hasData && !d.hasAnalysis).length}
                    </span> 天
                  </span>
                  <span>
                    完整数据: <span className="font-medium text-green-600">
                      {stats.dateList.filter((d: DateStats) => d.hasData && d.hasAnalysis).length}
                    </span> 天
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
