#!/usr/bin/env tsx

/**
 * 数据源更新跟踪脚本
 * 从当前时间开始，每隔 1 小时检查一次
 * https://cn.govopendata.com/xinwenlianbo/
 * 是否已经出现指定日期（例如 2025-11-30）
 * 一直持续到明天早上 9:00（本地时间）为止。
 */

const TARGET_DATE = '2025-11-30'; // 要监控的数据日期（可以按需修改）
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 小时

function getEndTime(): Date {
  const now = new Date();
  const end = new Date(now.getTime());
  end.setDate(end.getDate() + 1); // 明天
  end.setHours(9, 0, 0, 0); // 明天 09:00 本地时间
  return end;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function hasTargetDate(html: string): Promise<boolean> {
  // 简单判断：页面中是否包含目标日期字符串
  // 可以根据实际页面结构进一步优化（例如匹配链接或标题）
  return html.includes(TARGET_DATE) || html.includes('2025年11月30日');
}

async function checkOnce(): Promise<boolean> {
  const url = 'https://cn.govopendata.com/xinwenlianbo/';
  console.log(`\n[${new Date().toLocaleString()}] 开始检查数据源: ${url}`);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'News-Investment-Analyzer/track-script'
      }
    });

    if (!res.ok) {
      console.log(`❌ 请求失败，HTTP 状态码: ${res.status}`);
      return false;
    }

    const html = await res.text();
    const found = await hasTargetDate(html);

    if (found) {
      console.log(`✅ 在页面中检测到日期 ${TARGET_DATE}，数据源已更新`);
      return true;
    } else {
      console.log(`ℹ️ 暂未检测到日期 ${TARGET_DATE}，将稍后重试`);
      return false;
    }
  } catch (err) {
    console.error('❌ 检查过程中出错:', err);
    return false;
  }
}

async function main() {
  console.log('📡 启动数据源更新跟踪脚本');
  console.log(`目标日期: ${TARGET_DATE}`);

  const endTime = getEndTime();
  console.log(`跟踪结束时间（本地时间）: ${endTime.toLocaleString()}`);

  // 立即检查一次
  let found = await checkOnce();
  if (found) {
    console.log('🎉 已经更新，无需继续轮询');
    return;
  }

  // 周期性检查，直到找到或到达结束时间
  while (new Date() < endTime) {
    console.log(`⏰ 将在 1 小时后再次检查（${new Date(Date.now() + CHECK_INTERVAL_MS).toLocaleString()}）`);
    await sleep(CHECK_INTERVAL_MS);

    if (new Date() >= endTime) {
      break;
    }

    found = await checkOnce();
    if (found) {
      console.log('🎉 已检测到目标日期，结束跟踪');
      return;
    }
  }

  console.log('\n⏹ 已到达设定的结束时间，仍未检测到目标日期的更新');
}

if (require.main === module) {
  // Node 18+ 默认提供 fetch，如需兼容更老版本可改为引入 node-fetch
  main().catch(err => {
    console.error('脚本执行异常:', err);
    process.exit(1);
  });
}
