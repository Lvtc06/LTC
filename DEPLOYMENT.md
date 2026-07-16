# GitHub Pages 部署说明

当前生产地址：

```text
https://lvtc06.github.io/LTC/
```

## 自动部署

仓库的 `.github/workflows/deploy-pages.yml` 会在 `main` 分支每次推送后自动执行：

```text
npm ci
npm run build
上传 dist
发布 GitHub Pages
```

GitHub Pages 项目站点位于 `/LTC/`，`vite.config.ts` 已设置生产资源基础路径。Vue Router 使用 Hash 模式，因此刷新 `/#/history`、`/#/ranking`、`/#/profile` 或 `/#/admin` 不会出现 404。

## GitHub Secrets

仓库 Settings → Secrets and variables → Actions 中必须存在：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

只使用 Supabase Project URL 与 anon/publishable key。严禁配置 Service Role Key、secret key 或数据库密码。

## 查看部署

- Actions：`https://github.com/Lvtc06/LTC/actions`
- Pages 设置：`https://github.com/Lvtc06/LTC/settings/pages`
- 公网地址：`https://lvtc06.github.io/LTC/`

## Supabase 地址

Supabase Dashboard → Authentication → URL Configuration：

```text
Site URL: https://lvtc06.github.io/LTC/
Redirect URLs:
https://lvtc06.github.io/LTC/**
http://localhost:5173/**
```

## 发布后验证

1. 手机关闭 Wi-Fi，使用移动网络打开公网地址。
2. 使用管理员或普通用户账号登录。
3. 提交今日打卡并看到成功提示。
4. 刷新页面并重新进入历史记录，确认记录仍存在。
5. 打开体重趋势和排行榜。
6. 分别测试微信内置浏览器与手机系统浏览器。

## 常见错误

- **Actions 构建失败**：检查仓库 Secrets 是否齐全，并查看 Actions 第一条失败日志。
- **页面空白或资源 404**：确认 `vite.config.ts` 的 GitHub Actions base 为 `/LTC/`。
- **登录页提示缺少配置**：Secrets 名称必须与上文完全一致，修改后重新运行工作流。
- **登录失败**：确认 Supabase Auth 用户已创建并 Auto Confirm。
- **RLS 拒绝提交**：用户必须已加入活动，普通用户只能提交中国时区当天记录。
- **微信打不开**：确认使用 HTTPS 公网地址，而不是 localhost 或 127.0.0.1。
