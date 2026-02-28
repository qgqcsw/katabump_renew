# Cloudflare Worker 定时触发 GitHub Actions 方案

## 1. 概述

本方案使用 Cloudflare Workers 的定时触发器（Cron Triggers）来解决 GitHub Actions 定时任务不准时的问题。通过 Cloudflare Workers 定期调用 GitHub API 触发 workflow，确保续期任务按时执行。

## 2. 准备工作

### 2.1 所需账号
- GitHub 账号
- Cloudflare 账号

### 2.2 所需工具
- GitHub API Token（用于触发 workflow）
- Cloudflare Workers 环境

## 3. GitHub 配置

### 3.1 创建 GitHub API Token
1. 登录 GitHub 账号
2. 进入 Settings → Developer settings → Personal access tokens → Fine-grained tokens
3. 点击 "Generate new token"
4. 设置 token 名称（例如：`katabump-renew-trigger`）
5. 选择仓库访问权限：
   - Repository access: 选择你的 katabump 仓库
   - Permissions: 
     - Actions: Read and write
6. 点击 "Generate token" 并保存生成的 token

### 3.2 更新 GitHub Actions Workflow

创建或修改 `.github/workflows/renew.yml` 文件：

```yaml
name: Katabump Renew

on:
  repository_dispatch:
    types: [katabump_renew]
  workflow_dispatch:  # 手动触发

jobs:
  renew:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run renew
        run: node action_renew.js
        env:
          USERS_JSON: ${{ secrets.USERS_JSON }}
          WECOM_WEBHOOK_KEY: ${{ secrets.WECOM_WEBHOOK_KEY }}
          HTTP_PROXY: ${{ secrets.HTTP_PROXY }}
```

## 4. Cloudflare Workers 配置

### 4.1 创建 Cloudflare Worker
1. 登录 Cloudflare 控制台
2. 进入 Workers & Pages → Create Application → Create Worker
3. 名称：`katabump-renew-trigger`（或其他合适的名称）
4. 点击 "Deploy"

### 4.2 配置 Worker 代码
1. 进入 Worker 编辑页面
2. 将 `worker.js` 文件的内容复制到代码编辑器中
3. 点击 "Save and Deploy"

### 4.3 设置 Workers Secrets
1. 在 Worker 编辑页面，点击 "Settings" 标签
2. 点击 "Variables" → "Add variable"
3. 添加以下 Secrets：
   - 名称：`GITHUB_API_TOKEN`，值：你的 GitHub API Token
   - 名称：`REPO_OWNER`，值：你的 GitHub 用户名
   - 名称：`REPO_NAME`，值：你的 katabump 仓库名称
4. 确保勾选 "Encrypt" 选项，然后点击 "Add"

### 4.4 配置定时触发器
1. 在 Worker 编辑页面，点击 "Triggers" 标签
2. 点击 "Add Cron Trigger"
3. 设置 cron 表达式：
   - 例如：`0 0 * * *` （每天 UTC 时间 0 点执行）
   - 或：`0 */6 * * *` （每 6 小时执行一次）
4. 点击 "Save"

## 5. 测试验证

### 5.1 手动测试
1. 在 Cloudflare Worker 编辑页面，点击 "Quick Edit"
2. 点击 "Send" 按钮发送请求
3. 检查 Worker 日志，确认是否成功触发 GitHub Action
4. 进入 GitHub 仓库的 Actions 页面，确认 workflow 是否开始执行

### 5.2 定时测试
1. 等待定时触发器执行
2. 检查 Cloudflare Worker 日志
3. 确认 GitHub Actions workflow 是否被触发并成功执行

## 6. 监控和维护

### 6.1 日志查看
- **Cloudflare Workers**：在 Worker 编辑页面的 "Logs" 标签查看执行日志
- **GitHub Actions**：在仓库的 Actions 页面查看 workflow 执行日志

### 6.2 故障排查
- **Worker 执行失败**：检查 Worker 日志，确认 API Token 是否正确，网络连接是否正常
- **GitHub Action 未触发**：检查 API Token 权限，确认 repository_dispatch 配置是否正确
- **续期失败**：检查 action_renew.js 执行日志，确认网络连接、账号密码等是否正确

## 7. 优势和注意事项

### 7.1 优势
- **更准确的定时执行**：Cloudflare Workers 的定时触发器比 GitHub Actions 更可靠
- **更高的执行频率**：支持分钟级别的定时任务
- **更好的安全性**：使用 Cloudflare Workers Secrets 安全存储 API Token
- **全球分布**：Cloudflare 的全球网络提供更稳定的执行环境
- **免费额度**：Cloudflare Workers 有足够的免费额度满足续期需求

### 7.2 注意事项
- **API Token 安全**：确保 API Token 只授予必要的权限，不要分享给他人
- **Worker 执行时间**：Cloudflare Workers 有执行时间限制（10 秒），但本 Worker 执行时间很短，不会超过限制
- **免费额度**：Cloudflare Workers 免费额度为每天 10 万次请求，足够满足续期需求
- **网络连接**：确保 Cloudflare Workers 能够访问 GitHub API

## 8. 常见问题

### 8.1 Worker 执行失败
- **问题**：Worker 日志显示 "Missing required secrets"
- **解决**：检查是否正确设置了所有 Secrets（GITHUB_API_TOKEN、REPO_OWNER、REPO_NAME）

### 8.2 GitHub Action 未触发
- **问题**：Worker 执行成功，但 GitHub Action 未触发
- **解决**：检查 API Token 权限，确认是否有 Actions: Read and write 权限

### 8.3 定时触发器未执行
- **问题**：定时触发器设置后未执行
- **解决**：检查 cron 表达式是否正确，Cloudflare Workers 是否有足够的配额

## 9. 总结

通过 Cloudflare Workers 定时触发 GitHub Actions workflow，可以解决 GitHub Actions 定时任务不准时的问题，确保 katabump 续期任务按时执行。此方案具有可靠性高、配置简单、安全等优点，适合用于重要的定时任务场景。
