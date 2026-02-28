// Cloudflare Worker 代码，用于定时触发 GitHub Actions workflow

addEventListener('scheduled', event => {
  event.waitUntil(triggerGitHubAction());
});

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    await triggerGitHubAction();
    return new Response('GitHub Action triggered successfully', { status: 200 });
  }
  return new Response('Hello, this is Katabump renew trigger worker', { status: 200 });
}

async function triggerGitHubAction() {
  // 从 Cloudflare Workers Secrets 中获取 API Token
  const apiToken = SECRETS.GITHUB_API_TOKEN;
  const repoOwner = SECRETS.REPO_OWNER;
  const repoName = SECRETS.REPO_NAME;
  
  if (!apiToken || !repoOwner || !repoName) {
    console.error('Missing required secrets');
    return;
  }
  
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Katabump-Renew'
      },
      body: JSON.stringify({
        event_type: 'katabump_renew',
        client_payload: {
          timestamp: new Date().toISOString(),
          trigger: 'cloudflare_worker'
        }
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
