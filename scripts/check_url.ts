import axios from 'axios';
import * as https from 'https';

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true // 不抛出错误
});

async function check() {
  const urls = [
    'https://www.ndrc.gov.cn/xwdt/index_1.html',
    'https://www.ndrc.gov.cn/xwdt/index_1.shtml',
    'https://www.ndrc.gov.cn/xwdt/index_1.htm',
    'https://www.ndrc.gov.cn/xwdt/1.html'
  ];

  for (const url of urls) {
    console.log(`Checking ${url}...`);
    const res = await client.head(url);
    console.log(`Status: ${res.status}`);
  }
}

check();
