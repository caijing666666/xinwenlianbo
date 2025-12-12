// 存储适配器 - 自动检测环境并选择合适的存储方式

// 检测是否有Vercel KV配置
const hasVercelKV = process.env.KV_REST_API_URL && 
                   process.env.KV_REST_API_URL !== 'your_kv_rest_api_url_here' &&
                   process.env.KV_REST_API_TOKEN;

// 检测运行环境
const isVercel = process.env.VERCEL === '1';
const isNetlify = process.env.NETLIFY === 'true';
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

// 动态选择存储方式
let storage;
let storageType;

if (hasVercelKV) {
  // 只要有KV配置就使用Vercel KV（不再要求isVercel=true）
  storage = require('./storage');
  storageType = 'Vercel KV (云存储)';
} else if (isNetlify) {
  // Netlify环境 - 使用Netlify专用存储
  storage = require('./storage-netlify');
  storageType = 'Netlify (内存缓存)';
} else if (isGitHubActions) {
  // GitHub Actions环境 - 使用本地文件存储
  storage = require('./storage-local');
  storageType = 'GitHub Actions (文件存储)';
} else {
  // 开发环境或其他 - 使用本地文件存储
  storage = require('./storage-local');
  storageType = '本地文件存储';
}

console.log(`🔧 存储适配器: ${storageType}`);
console.log(`🔧 环境信息: Vercel=${!!isVercel}, Netlify=${!!isNetlify}, KV=${!!hasVercelKV}`);

// 重新导出所有函数
export const saveNews = storage.saveNews;
export const saveMultipleNews = storage.saveMultipleNews;
export const getNewsByDate = storage.getNewsByDate;
export const getRecentNews = storage.getRecentNews;
export const saveAnalysis = storage.saveAnalysis;
export const saveMultipleAnalyses = storage.saveMultipleAnalyses;
export const getAnalysisByDate = storage.getAnalysisByDate;
export const getRecentAnalyses = storage.getRecentAnalyses;
export const generateDailySummary = storage.generateDailySummary;
