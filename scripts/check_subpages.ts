import axios from 'axios';
import * as https from 'https';
import * as cheerio from 'cheerio';

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

async function checkSubPages() {
  const subPages = [
    'https://www.ndrc.gov.cn/xwdt/szyw/',
    'https://www.ndrc.gov.cn/xwdt/dt/sjdt/',
    'https://www.ndrc.gov.cn/xwdt/dt/dfdt/',
  ];
  
  for (const url of subPages) {
    console.log(`Checking ${url}...`);
    try {
        const res = await client.get(url);
        const html = res.data;
        if (html.includes('createPageHTML')) {
            console.log(`Found createPageHTML in ${url}`);
            const index = html.indexOf('createPageHTML');
            console.log(html.substring(index, index + 200));
        }
    } catch (e) {
        console.log(`Error fetching ${url}:`, e.message);
    }
  }
}

checkSubPages();
