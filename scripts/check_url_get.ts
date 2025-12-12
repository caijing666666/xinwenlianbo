import axios from 'axios';
import * as https from 'https';

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true
});

async function check() {
  const urls = [
    'https://www.ndrc.gov.cn/xwdt/index_1.html',
    'https://www.ndrc.gov.cn/xwdt/index_1.shtml',
    'https://www.ndrc.gov.cn/xwdt/index_1.htm'
  ];

  for (const url of urls) {
    console.log(`GET ${url}...`);
    const res = await client.get(url);
    console.log(`Status: ${res.status}`);
  }
}

check();
