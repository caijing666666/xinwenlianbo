'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiResponse } from '@/types';
import { 
  Database, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  BarChart3,
  Clock
} from 'lucide-react';

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

export default function StatusPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 加载数据统计
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data-management');
      const data: ApiResponse<DataStats> = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  const completionRate = stats ? Math.round((stats.daysWithAnalysis / 30) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">数据状态监控</h1>
                <p className="text-gray-600">最近30天新闻联播数据预抓取状态</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                更新时间: {lastUpdate.toLocaleTimeString('zh-CN')}
              </div>
              <button
                onClick={loadStats}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 进度概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">完成进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">总新闻数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalNews || 0}</div>
              <p className="text-xs text-gray-500">已抓取</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">总分析数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats?.totalAnalyses || 0}</div>
              <p className="text-xs text-gray-500">AI分析完成</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">完整天数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.daysWithAnalysis || 0}/30</div>
              <p className="text-xs text-gray-500">有新闻+分析</p>
            </CardContent>
          </Card>
        </div>

        {/* 每日状态 */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                每日数据状态
              </CardTitle>
              <CardDescription>
                绿色表示数据完整，红色表示缺少数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {stats.dateList.slice(0, 28).map((item) => (
                  <div
                    key={item.date}
                    className={`p-3 rounded-lg border text-center ${
                      item.hasAnalysis 
                        ? 'bg-green-50 border-green-200' 
                        : item.hasData
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-600">
                      {item.date.split('-')[2]}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      {item.hasAnalysis ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : item.hasData ? (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.newsCount}/{item.analysisCount}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 图例 */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>完整数据</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>仅有新闻</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>无数据</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 实时状态 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 批量预抓取状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 mb-2">
                <strong>当前状态：</strong>批量预抓取正在后台运行中...
              </p>
              <p className="text-sm text-blue-700">
                系统正在自动抓取最近30天的新闻联播数据并进行AI分析，预计需要10-15分钟完成。
                页面每30秒自动刷新数据状态。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
