# WeCom 企业微信通知配置指南

## 1. 创建企业微信机器人

1. **进入企业微信群组**：
   - 打开 WeCom 企业微信，进入你想要接收通知的群组

2. **添加机器人**：
   - 点击群组右上角的「...」图标
   - 选择「群机器人」
   - 点击「添加」按钮
   - 为机器人取一个名称（例如：Katabump 续期通知）
   - 点击「添加」完成创建

3. **获取 Webhook URL**：
   - 创建成功后，会生成一个 Webhook URL
   - 复制这个 URL，格式通常为：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

## 2. 配置环境变量

在 GitHub Actions 或本地环境中设置以下环境变量：

### GitHub Actions 配置
1. 进入你的仓库 → Settings → Secrets and variables → Actions
2. 点击「New repository secret」
3. 名称：`WECOM_WEBHOOK_KEY`
4. 值：仅粘贴 Webhook URL 中的 key 值（例如：`XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`）
5. 点击「Add secret」保存

### 本地环境配置
在你的本地环境中设置环境变量：

- **Windows**：
  ```powershell
  set WECOM_WEBHOOK_KEY=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  ```

- **Linux/macOS**：
  ```bash
  export WECOM_WEBHOOK_KEY=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  ```

### 获取 Webhook Key
从完整的 Webhook URL 中提取 key 值：
- 完整 URL 格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
- 提取后的 key：`XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

## 3. 验证配置

运行脚本后，你应该会在企业微信群组中收到通知消息，包括：
- 登录失败通知
- 暂无法续期通知
- 续期成功通知

## 4. 通知格式

WeCom 企业微信通知支持以下格式：
- **文字消息**：使用纯文本格式，会自动移除 Markdown 标记
- **图片消息**：会自动上传并发送截图

## 5. 故障排查

如果没有收到通知，请检查：
1. **Webhook Key 配置**：
   - 确认 `WECOM_WEBHOOK_KEY` 环境变量是否正确设置
   - 验证 Key 值是否正确，应该是 32 位的 UUID 格式

2. **企业微信机器人状态**：
   - 确认 WeCom 企业微信机器人是否被删除或禁用
   - 检查企业微信群组是否仍然存在

3. **网络连接**：
   - 确认服务器可以访问企业微信 API (`https://qyapi.weixin.qq.com`)
   - 检查网络防火墙或代理设置是否阻止了请求
   - 查看网络连接是否稳定，有无超时情况

4. **消息限制**：
   - 消息长度是否超过 2048 字节（企业微信限制）
   - 图片大小是否超过 2MB（企业微信限制）

5. **频率限制**：
   - 是否在短时间内发送了过多消息，触发了企业微信的频率限制
   - 是否超过了企业微信 API 的调用频率限制

6. **脚本日志**：
   - 查看脚本运行日志，会有详细的错误信息
   - 注意日志中的 `[WeCom]` 前缀的消息，包含具体的失败原因

7. **企业微信设置**：
   - 企业微信客户端通知设置是否开启
   - 群组消息免打扰设置是否导致通知被静音
   - 企业微信版本是否过低

8. **API 响应**：
   - 脚本会记录企业微信 API 的响应数据，包括错误码和错误信息
   - 根据错误码参考企业微信开发文档进行排查

## 6. 注意事项

- WeCom 企业微信机器人的消息发送频率有限制，请不要频繁发送消息
- 图片大小限制为 2MB 以内
- 确保 WeCom 企业微信机器人有发送消息的权限
