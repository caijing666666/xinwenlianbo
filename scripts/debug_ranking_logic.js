const fs = require('fs');
const path = require('path');

const dataDir = path.join('d:', 'xinwenlianbo-main', 'data', 'analysis');
const targetDate = '2025-12-06';

try {
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let matchingFiles = [];
  let analyses = [];

  console.log(`Checking files for newsDate: ${targetDate}`);

  files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        const data = JSON.parse(content);
        
        // 模拟 getAnalysisByDate 的逻辑
        if (data.newsDate === targetDate) {
            matchingFiles.push(file);
            analyses.push(data);
        }
    } catch (e) {
        // ignore error
    }
  });

  console.log(`Found ${matchingFiles.length} files with newsDate === "${targetDate}"`);
  console.log('Files:', matchingFiles.join(', '));

  // 模拟 mergeAndDeduplicateStocks 逻辑
  const stockMap = new Map();
  
  for (const analysis of analyses) {
    if (!analysis.companyImpacts) continue;
    
    for (const company of analysis.companyImpacts) {
      const key = company.stockCode || company.companyName;
      const existing = stockMap.get(key);
      
      // 调试：打印迈瑞医疗的处理过程
      if (company.companyName.includes('迈瑞')) {
          console.log(`Found 迈瑞医疗 in ${analysis.newsId}: Score ${company.impactScore}`);
      }

      if (!existing || company.impactScore > existing.impactScore) {
        stockMap.set(key, company);
      }
    }
  }
  
  const allStocks = Array.from(stockMap.values());
  const sortedStocks = allStocks.sort((a, b) => b.impactScore - a.impactScore);

  // 打印前几名
  console.log('\nAll Stocks:');
  sortedStocks.forEach((s, i) => {
      console.log(`${i+1}. ${s.companyName} (${s.stockCode}): ${s.impactScore}`);
  });

  // 统计总数
  console.log(`\nTotal Stocks: ${sortedStocks.length}`);

} catch (error) {
  console.error('Error:', error);
}
