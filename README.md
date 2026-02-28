# Katabump Server Renew


这是一个用于自动续期 Katabump 服务器的自动化脚本。它利用 Playwright 和 CDP (Chrome DevTools Protocol) 技术来模拟用户操作，能够有效绕过 Cloudflare Turnstile 验证码，确保持续的服务器服务。

支持 **Windows 本地运行** 和 **GitHub Actions 云端运行**。

## ✨ 特性

- **智能过盾**: 通过 CDP 协议模拟真实鼠标轨迹和点击行为，结合屏幕坐标伪造，高成功率绕过 Cloudflare Turnstile。
- **自动重试**: 内置严格的验证重试机制，如果验证失败会自动重启验证流程。
- **多用户支持**: 支持配置多个账号批量续期。
- **云端/本地**: 既可以在本地电脑跑，也可以利用 GitHub Actions 每天定时自动跑。

---

## 🚀 GitHub Actions 云端运行 (推荐)

这是最省心的方式，配置一次即可每天自动执行。

1. **Fork 本仓库** 到你的 GitHub 账号。
2. 进入你的仓库，点击 **Settings** -> **Secrets and variables** -> **Actions**。
3. 点击 **New repository secret**，添加一个名为 `USERS_JSON` 的 Secret。
4. **Value** 的格式必须是 JSON 数组（请尽量压缩为一行）：
   ```json
   [{"username": "your_email@example.com", "password": "your_password"}, {"username": "another@example.com", "password": "pwd"}]
   ```
5. **(可选) 配置代理**:
   如果 GitHub Actions 的 IP 被屏蔽，或者你想使用特定的 IP 访问，可以添加名为 `HTTP_PROXY` 的 Secret。
   - **格式**:
     - 无认证: `http://ip:port`
     -带认证: `http://username:password@ip:port`
   - **说明**: 脚本会自动检测代理有效性，如果支持认证会自动处理。默认不启用。

6. **(可选) 企业微信消息推送**:
   如果你希望在续期成功、失败或跳过时收到企业微信通知（包含截图），请配置以下 Secret：
   - `WECOM_WEBHOOK_KEY`: 你的企业微信机器人 Webhook Key (从企业微信群机器人设置中获取)。

   > 详细配置方法请参考 [WECOM_NOTIFICATION_CONFIG.md](WECOM_NOTIFICATION_CONFIG.md) 文件。<br>
   > 如果未配置，脚本将跳过发送通知。

### 4. 运行结果与截图

- **运行日志**: 在 Actions 中的 `Run Renew Script` 步骤查看。
- **截图留存**: 每次运行（无论成功与否），通过 `Upload Screenshots` 步骤自动上传截图。
  - 你可以在 Workflow 运行详情页的 **Artifacts** 区域下载 `screenshots` 压缩包。
  - 每个账号对应一张截图（`username.png`），方便确认状态。

5. 保存后，进入 **Actions** 页面，启用 Workflow。
6. 你也可以手动点击 "Run workflow" 立即测试。

### 5. Cloudflare Worker 定时触发 (推荐)

为了解决 GitHub Actions 定时任务不准时的问题，推荐使用 Cloudflare Workers 的定时触发器来触发 workflow。

#### 5.1 准备工作
- GitHub 账号
- Cloudflare 账号
- GitHub API Token（用于触发 workflow）

#### 5.2 配置步骤
1. **创建 GitHub API Token**：
   - 登录 GitHub 账号
   - 进入 Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - 创建一个新的 token，名称为 `katabump-renew-trigger`
   - 选择仓库访问权限，确保有 Actions: Read and write 权限
   - 保存生成的 token

2. **配置 Cloudflare Worker**：
   - 登录 Cloudflare 控制台
   - 进入 Workers & Pages → Create Application → Create Worker
   - 名称：`katabump-renew-trigger`
   - 点击 "Deploy"
   - 进入 Worker 编辑页面，将 `worker.js` 文件的内容复制到代码编辑器中
   - 点击 "Save and Deploy"

3. **设置 Workers Secrets**：
   - 在 Worker 编辑页面，点击 "Settings" 标签
   - 点击 "Variables" → "Add variable"
   - 添加以下 Secrets：
     - 名称：`GITHUB_API_TOKEN`，值：你的 GitHub API Token
     - 名称：`REPO_OWNER`，值：你的 GitHub 用户名
     - 名称：`REPO_NAME`，值：你的 katabump 仓库名称
   - 确保勾选 "Encrypt" 选项，然后点击 "Add"

4. **配置定时触发器**：
   - 在 Worker 编辑页面，点击 "Triggers" 标签
   - 点击 "Add Cron Trigger"
   - 设置 cron 表达式，例如：`0 0 * * *` （每天 UTC 时间 0 点执行，即北京时间 8 点执行）
   - 点击 "Save"

#### 5.3 测试验证
- **手动测试**：在 Cloudflare Worker 编辑页面，点击 "Quick Edit"，然后点击 "Send" 按钮发送请求
- **定时测试**：等待定时触发器执行，检查 Cloudflare Worker 日志和 GitHub Actions workflow 执行情况

#### 5.4 优势
- **更准确的定时执行**：Cloudflare Workers 的定时触发器比 GitHub Actions 更可靠
- **更高的执行频率**：支持分钟级别的定时任务
- **更好的安全性**：使用 Cloudflare Workers Secrets 安全存储 API Token
- **全球分布**：Cloudflare 的全球网络提供更稳定的执行环境
- **免费额度**：Cloudflare Workers 有足够的免费额度满足续期需求

> 详细配置方法请参考 [CLOUDFLARE_WORKER_SETUP.md](CLOUDFLARE_WORKER_SETUP.md) 文件。

---

## 💻 Windows 本地运行指南

如果你想在本地观察运行过程或进行调试，请按以下步骤操作。

### 1. 环境准备

确保你已经安装了 [Node.js](https://nodejs.org/) (建议版本 v18+)。

### 2. 安装依赖

在项目根目录打开终端 (PowerShell 或 CMD)，运行：

```bash
npm install
```

### 3. 配置账号

项目中有一个 `login.json.template` 模板文件。

1. 将其**重命名**为 `login.json`。
2. 用记事本或编辑器打开，填入你的账号密码：
   ```json
   [
       {
           "username": "myemail@gmail.com",
           "password": "mypassword123"
       }
   ]
   ```

   > **注意**: `login.json` 已被加入 `.gitignore`，不会被上传到 GitHub，请放心使用。
   >

### 4. 配置 Chrome 路径

打开 `renew.js` 文件，找到：

```javascript
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = path.join(__dirname, 'ChromeData_Katabump');
const HEADLESS = true;
```

* **CHROME_PATH**: 这是你本地 Chrome 浏览器的安装路径。如果你的安装位置不同，请务必修改！
* **USER_DATA_DIR**:
  * 这是一个用于存放 Script 运行时产生的浏览器数据（缓存、Cookie、登录状态等）的文件夹。
  * **作用**: 它能让你的登录状态保持更久，不需要每次运行都重新输入密码。
  * **能不能删？**: **可以删**。如果你想要重置所有状态（彻底清除缓存），只需删除这个文件夹即可。脚本下次运行时会自动重新创建它。
* **HEADLESS**:
  * `false`: 脚本运行时会弹出一个 Chrome 窗口，你可以看到它在做什么。
  * `true`: (默认)脚本在后台无头运行，界面不可见（适合只想静默完成任务时开启）。

### 3. 运行脚本

如果你需要使用代理运行脚本，请设置环境变量 `HTTP_PROXY`：

**Powershell:**
```powershell
$env:HTTP_PROXY="http://user:pass@127.0.0.1:7890"
node renew.js
```

**CMD:**
```cmd
set HTTP_PROXY=http://user:pass@127.0.0.1:7890
node renew.js
```

如果不设置代理，直接运行：
```bash
node renew.js
```

脚本会自动启动 Chrome (如果需要)，逐个处理账号，并在根目录下的 `photo/` 文件夹中保存每个账号运行结束时的截图（`账号名.png`）。窗口（默认无头模式为 false，你可以看到操作过程），并依次为列表中的用户续期。

---

## 🛠️ 项目结构

* `renew.js`: Windows 本地运行的主程序。
* `action_renew.js`: 专门用于 GitHub Actions 环境的脚本（适配 Linux/Headless）。
* `.github/workflows/renew.yml`: GitHub Actions 的定时任务配置文件。
* `WECOM_NOTIFICATION_CONFIG.md`: 企业微信通知配置指南。
* `CLOUDFLARE_WORKER_SETUP.md`: Cloudflare Worker 定时触发配置指南。
* `worker.js`: Cloudflare Worker 代码，用于定时触发 GitHub Actions。
* `login.json`: (需手动创建) 存放本地运行的账号信息。

---

## 📚 参考项目

- [XCQ0607/katabump](https://github.com/XCQ0607/katabump): 本项目参考了此仓库的实现思路和部分代码。
