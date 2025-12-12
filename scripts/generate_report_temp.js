const fs = require('fs');
const path = require('path');

const dataDir = path.join('d:', 'xinwenlianbo-main', 'data', 'analysis');
const targetDate = '2025-12-06';

// 获取颜色函数
function getRecommendationLevel(score) {
  if (score >= 85) return { label: '强烈推荐', level: 'strong_buy' };
  if (score >= 75) return { label: '推荐', level: 'buy' };
  return { label: '中性', level: 'neutral' };
}

try {
  const files = fs.readdirSync(dataDir).filter(f => f.startsWith(targetDate) && f.endsWith('.json'));
  
  let allCompanies = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const data = JSON.parse(content);
    if (data.companyImpacts && Array.isArray(data.companyImpacts)) {
      allCompanies.push(...data.companyImpacts);
    }
  });

  // 合并去重
  const stockMap = new Map();
  allCompanies.forEach(company => {
    const key = company.stockCode || company.companyName;
    const existing = stockMap.get(key);
    
    // 如果没有记录，或者当前记录分数更高，则更新
    if (!existing || company.impactScore > existing.impactScore) {
      stockMap.set(key, company);
    }
  });

  const uniqueStocks = Array.from(stockMap.values());

  // 排序
  const sortedStocks = uniqueStocks.sort((a, b) => b.impactScore - a.impactScore);

  // 过滤推荐股票 (分数 >= 75)
  const recommendedStocks = sortedStocks.filter(s => s.impactScore >= 75);

  console.log(`# 📅 ${targetDate} 股票推荐列表\n`);
  
  if (recommendedStocks.length === 0) {
      console.log('今日暂无强烈推荐或推荐评级的股票。');
  } else {
      console.log('| 排名 | 股票名称 | 代码 | 交易所 | 推荐等级 | 分数 | 理由 |');
      console.log('|---|---|---|---|---|---|---|');
      
      recommendedStocks.forEach((stock, index) => {
        const { label } = getRecommendationLevel(stock.impactScore);
        const emoji = label === '强烈推荐' ? '🔴' : '🟠';
        console.log(`| ${index + 1} | **${stock.companyName}** | ${stock.stockCode || '-'} | ${stock.exchange || '-'} | ${emoji} ${label} | **${stock.impactScore}** | ${stock.reasoning.replace(/\n/g, ' ')} |`);
      });
  }

} catch (error) {
  console.error('Error:', error);
}
