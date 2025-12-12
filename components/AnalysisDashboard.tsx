'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImpactCard } from './ImpactCard';
import {
  InvestmentAnalysis,
  IndustryImpact,
  CompanyImpact,
  FuturesImpact,
  BondImpact,
} from '@/types';
import { TrendingUp, Building2, Package, Landmark, Calendar } from 'lucide-react';

interface AnalysisDashboardProps {
  analyses: InvestmentAnalysis[];
  date: string;
}

export function AnalysisDashboard({ analyses, date }: AnalysisDashboardProps) {
  // 汇总所有分析结果
  const allIndustries = analyses.flatMap(a => a.industryImpacts);
  const allCompanies = analyses.flatMap(a => a.companyImpacts);
  const allFutures = analyses.flatMap(a => a.futuresImpacts);
  const allBonds = analyses.flatMap(a => a.bondImpacts);

  // 排序
  const topIndustries = [...allIndustries].sort((a, b) => b.impactScore - a.impactScore).slice(0, 10);
  const topCompanies = [...allCompanies].sort((a, b) => b.impactScore - a.impactScore).slice(0, 10);
  const topFutures = [...allFutures].sort((a, b) => b.impactScore - a.impactScore).slice(0, 10);
  const topBonds = [...allBonds].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5);

  // 🔥 新增：筛选推荐项（利好且高评分）
  const recommendedCompanies = [...allCompanies]
    .filter(c => c.impactType === 'positive' && c.impactScore >= 70)
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5);

  const recommendedFutures = [...allFutures]
    .filter(f => f.impactType === 'positive' && f.impactScore >= 70)
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5);

  // 计算整体情绪
  const sentimentCounts = {
    bullish: analyses.filter(a => a.overallSentiment === 'bullish').length,
    bearish: analyses.filter(a => a.overallSentiment === 'bearish').length,
    neutral: analyses.filter(a => a.overallSentiment === 'neutral').length,
  };

  const overallSentiment =
    sentimentCounts.bullish > sentimentCounts.bearish ? 'bullish' :
    sentimentCounts.bearish > sentimentCounts.bullish ? 'bearish' : 'neutral';

  return (
    <div className="space-y-6">
      {/* 🔥 投资推荐区域 */}
      {(recommendedCompanies.length > 0 || recommendedFutures.length > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
            <span className="text-3xl mr-2">💎</span>
            今日投资推荐
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 推荐上市公司 */}
            {recommendedCompanies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  值得关注的上市公司
                </h3>
                <div className="space-y-2">
                  {recommendedCompanies.map((company, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-lg text-gray-800">{company.companyName}</span>
                          <span className="ml-2 text-sm text-gray-600">({company.stockCode})</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="success" className="text-base px-3 py-1">
                            {company.impactScore}分
                          </Badge>
                        </div>
                      </div>
                      {company.estimatedPriceImpact && (
                        <div className="text-sm font-semibold text-green-600 mb-1">
                          预估影响: {company.estimatedPriceImpact}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{company.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 推荐期货品种 */}
            {recommendedFutures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-orange-600" />
                  值得关注的期货品种
                </h3>
                <div className="space-y-2">
                  {recommendedFutures.map((futures, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-bold text-lg text-gray-800">{futures.commodity}</span>
                          <span className="ml-2 text-sm text-gray-600">({futures.exchange})</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="success" className="text-base px-3 py-1">
                            {futures.impactScore}分
                          </Badge>
                        </div>
                      </div>
                      {futures.priceDirection && (
                        <div className="text-sm font-semibold text-green-600 mb-1">
                          价格走向: {futures.priceDirection === 'up' ? '↗ 上涨' : futures.priceDirection === 'down' ? '↘ 下跌' : '→ 稳定'}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">{futures.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 头部统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Calendar className="w-4 h-4 inline mr-2" />
              分析日期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{date}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              新闻总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              市场情绪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                overallSentiment === 'bullish' ? 'success' :
                overallSentiment === 'bearish' ? 'danger' : 'secondary'
              }
              className="text-base px-3 py-1"
            >
              {overallSentiment === 'bullish' ? '看涨' :
               overallSentiment === 'bearish' ? '看跌' : '中性'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              投资机会
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topIndustries.length + topCompanies.length + topFutures.length}
            </div>
            <div className="text-xs text-gray-500">个潜在机会</div>
          </CardContent>
        </Card>
      </div>

      {/* 详细分析 */}
      <Tabs defaultValue="industries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="industries">
            <TrendingUp className="w-4 h-4 mr-2" />
            行业影响
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-2" />
            上市公司
          </TabsTrigger>
          <TabsTrigger value="futures">
            <Package className="w-4 h-4 mr-2" />
            期货商品
          </TabsTrigger>
          <TabsTrigger value="bonds">
            <Landmark className="w-4 h-4 mr-2" />
            债券市场
          </TabsTrigger>
        </TabsList>

        <TabsContent value="industries" className="space-y-4">
          <h3 className="text-lg font-semibold">受影响行业 TOP 10</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topIndustries.map((industry, index) => (
              <ImpactCard
                key={index}
                title={industry.industryName}
                score={industry.impactScore}
                type={industry.impactType}
                reasoning={industry.reasoning}
                confidence={industry.confidence}
                additionalInfo={
                  <div className="flex flex-wrap gap-1">
                    {industry.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <h3 className="text-lg font-semibold">受影响上市公司 TOP 10</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCompanies.map((company, index) => (
              <ImpactCard
                key={index}
                title={`${company.companyName} (${company.stockCode})`}
                score={company.impactScore}
                type={company.impactType}
                reasoning={company.reasoning}
                confidence={company.confidence}
                additionalInfo={
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{company.exchange}</Badge>
                      {company.estimatedPriceImpact && (
                        <Badge variant="secondary">
                          预估影响: {company.estimatedPriceImpact}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {company.relatedIndustries.map((ind, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ind}
                        </Badge>
                      ))}
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="futures" className="space-y-4">
          <h3 className="text-lg font-semibold">受影响期货商品 TOP 10</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topFutures.map((futures, index) => (
              <ImpactCard
                key={index}
                title={futures.commodity}
                score={futures.impactScore}
                type={futures.impactType}
                reasoning={futures.reasoning}
                confidence={futures.confidence}
                additionalInfo={
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{futures.exchange}</Badge>
                    {futures.priceDirection && (
                      <Badge variant="secondary">
                        价格走向: {
                          futures.priceDirection === 'up' ? '上涨' :
                          futures.priceDirection === 'down' ? '下跌' : '稳定'
                        }
                      </Badge>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bonds" className="space-y-4">
          <h3 className="text-lg font-semibold">债券市场影响分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topBonds.map((bond, index) => (
              <ImpactCard
                key={index}
                title={bond.bondType}
                score={bond.impactScore}
                type={bond.impactType}
                reasoning={bond.reasoning}
                confidence={bond.confidence}
                additionalInfo={
                  <div className="flex items-center gap-2">
                    {bond.yieldDirection && (
                      <Badge variant="outline">
                        收益率: {
                          bond.yieldDirection === 'up' ? '上升' :
                          bond.yieldDirection === 'down' ? '下降' : '稳定'
                        }
                      </Badge>
                    )}
                    {bond.riskLevel && (
                      <Badge variant={
                        bond.riskLevel === 'high' ? 'danger' :
                        bond.riskLevel === 'medium' ? 'warning' : 'success'
                      }>
                        风险: {
                          bond.riskLevel === 'high' ? '高' :
                          bond.riskLevel === 'medium' ? '中' : '低'
                        }
                      </Badge>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 新闻详情 */}
      <Card>
        <CardHeader>
          <CardTitle>新闻详情</CardTitle>
          <CardDescription>当日分析的所有新闻联播内容</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.map((analysis, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-semibold mb-2">{analysis.newsTitle}</h4>
                <p className="text-sm text-gray-600 mb-2">{analysis.newsContent}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    投资机会评分: {analysis.investmentOpportunityScore}
                  </Badge>
                  <Badge
                    variant={
                      analysis.overallSentiment === 'bullish' ? 'success' :
                      analysis.overallSentiment === 'bearish' ? 'danger' : 'secondary'
                    }
                  >
                    {analysis.overallSentiment === 'bullish' ? '看涨' :
                     analysis.overallSentiment === 'bearish' ? '看跌' : '中性'}
                  </Badge>
                </div>
                {analysis.summary && (
                  <p className="text-sm text-gray-700 mt-2 italic">{analysis.summary}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
