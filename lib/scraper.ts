import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from '@/types';
import * as https from 'https';

const CATEGORY_URLS = [
  'https://www.ndrc.gov.cn/xwdt/szyw/',      // 时政要闻
  'https://www.ndrc.gov.cn/xwdt/dt/sjdt/',   // 司局动态
  'https://www.ndrc.gov.cn/xwdt/dt/dfdt/',   // 地方动态
];

// 创建自定义 axios 实例
const client = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  }
});

/**
 * 抓取发改委新闻数据
 * @param date 日期，格式：YYYY-MM-DD
 */
export async function scrapeNewsData(date?: string): Promise<NewsItem[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const targetDateSlashed = targetDate.replace(/-/g, '/');
    const targetTime = new Date(targetDateSlashed).getTime();
    
    console.log(`正在抓取发改委新闻 (目标日期: ${targetDate})`);
    
    const newsLinks: { title: string; url: string }[] = [];
    
    // 并行处理每个分类
    await Promise.all(CATEGORY_URLS.map(async (baseUrl) => {
        let pageIndex = 0;
        const maxPages = 10; // 每个分类最多翻10页
        let foundOlder = false;

        while (pageIndex < maxPages && !foundOlder) {
            const pageUrl = pageIndex === 0 ? baseUrl : `${baseUrl}index_${pageIndex}.html`;
            // console.log(`Scanning ${pageUrl}...`); // 减少日志输出

            try {
                const response = await client.get(pageUrl);
                const $ = cheerio.load(response.data);
                let foundInThisPage = false;
                let hasValidDate = false;

                $('li').each((_, el) => {
                    const $el = $(el);
                    const text = $el.text().trim();
                    const $a = $el.find('a');
                    
                    if ($a.length > 0) {
                        const dateMatch = text.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
                        if (dateMatch) {
                            hasValidDate = true;
                            const newsDate = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
                            const newsTime = new Date(newsDate).getTime();

                            if (newsDate === targetDateSlashed) {
                                let href = $a.attr('href');
                                if (href) {
                                    // 处理相对路径
                                    if (href.startsWith('./')) {
                                        href = baseUrl + href.substring(2);
                                    } else if (!href.startsWith('http')) {
                                        if (href.startsWith('/')) {
                                            href = 'https://www.ndrc.gov.cn' + href;
                                        } else {
                                            href = baseUrl + href;
                                        }
                                    }
                                    
                                    // 去重
                                    if (!newsLinks.some(n => n.url === href)) {
                                        newsLinks.push({
                                            title: $a.text().trim() || $el.text().replace(newsDate, '').trim(),
                                            url: href
                                        });
                                    }
                                    foundInThisPage = true;
                                }
                            } else if (newsTime < targetTime) {
                                foundOlder = true;
                            }
                        }
                    }
                });

                // 如果页面没有解析出任何日期，可能是格式不对，防止死循环
                if (!hasValidDate && pageIndex > 0) {
                    break;
                }
                
                // 如果当前页全是更新的新闻（还没到目标日期），继续翻页
                // 如果当前页已经包含更旧的新闻，且没有找到目标日期的新闻（foundInThisPage=false），说明目标日期可能已经过去了或者这一天没新闻
                // 但为了保险（比如置顶新闻干扰），只有当明确找到更旧新闻时才标记 foundOlder
            
            } catch (err) {
                 // 404 表示没有更多页了
                 if (axios.isAxiosError(err) && err.response?.status === 404) {
                     break;
                 }
                 console.warn(`Error scanning ${pageUrl}: ${err instanceof Error ? err.message : String(err)}`);
            }
            
            pageIndex++;
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }));

    console.log(`共找到 ${newsLinks.length} 条符合 ${targetDate} 的新闻链接`);

    const newsItems: NewsItem[] = [];

    // 2. 并发抓取详情页
    // 限制并发数为 5
    const chunks = [];
    for (let i = 0; i < newsLinks.length; i += 5) {
      chunks.push(newsLinks.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (link, index) => {
        try {
          // console.log(`Fetching detail: ${link.title.substring(0, 15)}...`);
          const detailRes = await client.get(link.url);
          const $$ = cheerio.load(detailRes.data);
          
          let content = $$('.TRS_Editor').text().trim();
          if (!content) content = $$('.article_content').text().trim();
          if (!content) content = $$('#zoom p').map((_, p) => $$(p).text().trim()).get().join('\n');
          
          // 兜底策略
          if (!content) {
             let maxLen = 0;
             $$('div, p').each((_, el) => {
                 const t = $$(el).text().trim();
                 if (t.length > maxLen && t.length > 100) {
                     content = t;
                     maxLen = t.length;
                 }
             });
          }

          if (content) {
            return {
              id: `${targetDate}-${newsItems.length + index}`, // 临时ID，最后会重置
              date: targetDate,
              title: link.title,
              content: content,
              sourceUrl: link.url,
              scrapedAt: new Date().toISOString(),
            } as NewsItem;
          }
        } catch (err) {
          console.error(`Failed to fetch content for ${link.url}`);
          return null;
        }
      });

      const results = await Promise.all(promises);
      results.forEach(item => {
        if (item) newsItems.push(item);
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 重新生成ID
    newsItems.forEach((item, idx) => {
        item.id = `${targetDate}-${String(idx + 1).padStart(3, '0')}`;
    });
    
    console.log(`成功抓取 ${newsItems.length} 条新闻内容`);
    return newsItems;
    
  } catch (error) {
    console.error('抓取新闻数据失败:', error);
    throw new Error(`Failed to scrape news: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 抓取最近N天的新闻数据
 */
export async function scrapeRecentNews(days: number = 7): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      const news = await scrapeNewsData(dateStr);
      allNews.push(...news);
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`抓取 ${dateStr} 的新闻失败:`, error);
    }
  }
  
  return allNews;
}
