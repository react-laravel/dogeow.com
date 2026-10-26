# 首页构建验证不再依赖 A

工作流使用 GitHub 托管 `ubuntu-24.04`、固定 Node 24.16.0 和 npm 锁文件运行现有测试与构建，验证 C 的专用 SSH、TLS、页面和资源。它始终调用 `deploy-to-c.sh --check-only`；push 和手动运行都不会上传或启用 master 的新版首页。

C 当前仍保留 `snapshot-20260424070040` 的首页内容。后续若要发布不同首页，必须单独确认内容和修改发布流程。

`C_DEPLOY_SSH_KEY` 应轮换为 `main-sites-ssh-gateway homepage-check` 的专用 key，仅允许检查 `/var/www/homepage/releases` 是否存在，不允许 rsync、发布、重启或访问 Next。固定 C host key 继续使用 `C_DEPLOY_KNOWN_HOSTS`。新来源范围和长期 key 的配置须先获用户批准。

首次真实 GitHub 托管工作流验证成功后再撤销 C 上旧 A 来源的共享 key，并清理 A 构建依赖。本文档不表示已经配置 key、提交或运行工作流。
