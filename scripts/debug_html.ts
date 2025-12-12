import axios from 'axios';
import * as https from 'https';
import * as cheerio from 'cheerio';

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function debugHtml() {
  try {
    const url = 'https://www.ndrc.gov.cn/xwdt/';
    console.log(`Fetching ${url}...`);
    const res = await client.get(url);
    const html = res.data;
    
    console.log('--- Pagination Search ---');
    // 搜索常见的翻页关键词
    const keywords = ['index_', 'createPageHTML', '下一页', 'page', 'countPage'];
    
    for (const kw of keywords) {
        if (html.includes(kw)) {
            console.log(`Found keyword "${kw}":`);
            // 打印上下文
            const index = html.indexOf(kw);
            console.log(html.substring(Math.max(0, index - 100), Math.min(html.length, index + 200)));
            console.log('---');
        }
    }
    
    // 提取所有script标签内容看看
    const $ = cheerio.load(html);
    $('script').each((i, el) => {
        const content = $(el).html();
        if (content && (content.includes('createPageHTML') || content.includes('index_'))) {
             console.log('Script content match:');
             console.log(content.trim());
        }
    });

  } catch (err) {
    console.error(err);
  }
}

debugHtml();
