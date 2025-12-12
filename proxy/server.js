#!/usr/bin/env node

// 简单中转服务：接收 ?url=，在服务器上发起请求并把原始内容返回。
// 仅允许访问白名单里的域名，避免被滥用。

const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 允许被代理的域名列表
const ALLOWED_HOSTS = new Set([
  'cn.govopendata.com',
]);

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '', `http://${req.headers.host}`);

    if (reqUrl.pathname !== '/proxy') {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const target = reqUrl.searchParams.get('url');
    if (!target) {
      res.statusCode = 400;
      res.end('Missing url parameter');
      return;
    }

    const targetUrl = new URL(target);
    if (!ALLOWED_HOSTS.has(targetUrl.hostname)) {
      res.statusCode = 403;
      res.end('Host not allowed');
      return;
    }

    console.log(`[proxy] Fetching: ${target}`);

    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      // 简单透传部分常见头
      if (['content-type', 'content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const body = await upstream.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    console.error('[proxy] Error:', err);
    res.statusCode = 500;
    res.end('Proxy error');
  }
});

server.listen(PORT, () => {
  console.log(`[proxy] Server listening on port ${PORT}`);
});
