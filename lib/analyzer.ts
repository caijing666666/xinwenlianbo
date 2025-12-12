import OpenAI from 'openai';
import {
  NewsItem,
  InvestmentAnalysis,
  IndustryImpact,
  CompanyImpact,
  FuturesImpact,
  BondImpact,
} from '@/types';

// 千问 API 配置（兼容 OpenAI 格式）
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.QWEN_API_KEY) {
      console.error('❌ 错误: QWEN_API_KEY 环境变量未配置');
      throw new Error('QWEN_API_KEY environment variable is required');
    }
    
    openai = new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
  }
  return openai;
}

/**
 * 使用 AI 分析新闻对投资市场的影响
 */
export async function analyzeNewsImpact(news: NewsItem): Promise<InvestmentAnalysis> {
  try {
    const prompt = `
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
`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'qwen-max', // 千问最强模型，也可选择 qwen-plus 或 qwen-turbo
      messages: [
        {
          role: 'system',
          content: '你是一名专业的投资分析师，擅长分析新闻对股票、期货、债券市场的影响。请以专业、客观的角度进行分析。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      // 注意：千问需要在 prompt 中明确要求 JSON 格式
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('AI 返回空结果');
    }

    // 提取 JSON 内容（千问可能返回带说明的文本）
    let jsonText = analysisText;
    
    // 尝试提取 JSON 代码块
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                      analysisText.match(/```\s*([\s\S]*?)\s*```/) ||
                      analysisText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      jsonText = jsonMatch[1] || jsonMatch[0];
    }
    
    // 清理可能的前后缀文本
    jsonText = jsonText.trim();
    if (!jsonText.startsWith('{')) {
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace !== -1) {
        jsonText = jsonText.substring(firstBrace);
      }
    }
    if (!jsonText.endsWith('}')) {
      const lastBrace = jsonText.lastIndexOf('}');
      if (lastBrace !== -1) {
        jsonText = jsonText.substring(0, lastBrace + 1);
      }
    }

    const parsedAnalysis = JSON.parse(jsonText);

    const analysis: InvestmentAnalysis = {
      newsId: news.id,
      newsDate: news.date,
      newsTitle: news.title,
      newsContent: news.content,
      industryImpacts: parsedAnalysis.industryImpacts || [],
      companyImpacts: parsedAnalysis.companyImpacts || [],
      futuresImpacts: parsedAnalysis.futuresImpacts || [],
      bondImpacts: parsedAnalysis.bondImpacts || [],
      overallSentiment: parsedAnalysis.overallSentiment || 'neutral',
      investmentOpportunityScore: parsedAnalysis.investmentOpportunityScore || 50,
      summary: parsedAnalysis.summary || '',
      analyzedAt: new Date().toISOString(),
      modelVersion: 'qwen-max',
    };

    return analysis;
  } catch (error) {
    console.error('分析新闻失败:', error);
    throw new Error(`Failed to analyze news: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 批量分析多条新闻
 */
export async function analyzeMultipleNews(newsList: NewsItem[]): Promise<InvestmentAnalysis[]> {
  const analyses: InvestmentAnalysis[] = [];

  for (const news of newsList) {
    try {
      const analysis = await analyzeNewsImpact(news);
      analyses.push(analysis);
      
      // 避免 API 请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`分析新闻 ${news.id} 失败:`, error);
    }
  }

  return analyses;
}
