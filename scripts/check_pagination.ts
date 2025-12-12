import axios from 'axios';
import * as https from 'https';
import * as cheerio from 'cheerio';

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function checkPagination() {
  try {
    const url = 'https://www.ndrc.gov.cn/xwdt/';
    console.log(`Fetching ${url}...`);
    const res = await client.get(url);
    const $ = cheerio.load(res.data);
    
    // 查找分页脚本或链接
    const scripts = $('script').map((i, el) => $(el).html()).get();
    const paginationScripts = scripts.filter(s => s && s.includes('createPageHTML'));
    
    if (paginationScripts.length > 0) {
        console.log('Found pagination script:', paginationScripts[0]);
    }

    // 查找包含 index_ 的链接
    const links = $('a').map((i, el) => $(el).attr('href')).get();
    const pageLinks = links.filter(l => l && l.includes('index_'));
    console.log('Found page links:', pageLinks);

  } catch (err) {
    console.error(err);
  }
}

checkPagination();
