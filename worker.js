// Cloudflare Worker 代码，用于定时触发 GitHub Actions workflow

// 防重复触发机制：使用时间戳和内存缓存
let lastTriggerTime = 0;
const COOLDOWN_PERIOD = 60000; // 60秒冷却期

export default {
  async scheduled(event, env) {
    // 定时触发不受冷却期限制
    await triggerGitHubAction(env);
  },
  
  async fetch(request, env) {
    // 检查是否在冷却期内
    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_PERIOD) {
      return new Response('触发过于频繁，请稍后再试', { status: 429 });
    }
    
    // 更新最后触发时间
    lastTriggerTime = now;
    
    // 触发GitHub Action
    await triggerGitHubAction(env);
    return new Response('人工触发成功：KataBump renew trigger worker -> GitHub Action', { status: 200 });
  }
};

async function triggerGitHubAction(env) {
  // 从 Cloudflare Workers 环境变量中获取 API Token
  const apiToken = env.GITHUB_API_TOKEN;
  const repoOwner = env.REPO_OWNER;
  const repoName = env.REPO_NAME;
  
  if (!apiToken || !repoOwner || !repoName) {
    console.error('Missing required environment variables');
    return;
  }
  
  // 使用正确的 API 端点
  const workflowId = 'renew.yml'; // workflow 文件名称
  const ref = 'main'; // 分支名称
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowId}/dispatches`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Katabump-Renew',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        ref: ref // 只保留必需的分支名称参数
      })
    });
    
    if (response.ok) {
      console.log('GitHub Action triggered successfully');
    } else {
      console.error('Failed to trigger GitHub Action:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error triggering GitHub Action:', error.message);
  }
}
