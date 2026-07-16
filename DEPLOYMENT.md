# GitHub 与 Cloudflare Pages 部署手册

## 当前构建配置

```text
Framework preset: Vue（选择 Vite 也可以）
Build command: npm run build
Build output directory: dist
Production branch: main
```

项目使用 Vue Router history 模式。`public/_redirects` 会在构建时复制成 `dist/_redirects`，将所有子路由回退到 `index.html`，避免刷新 `/history`、`/ranking`、`/profile` 或 `/admin` 时出现 404。

## 上传 GitHub

先在 https://github.com/new 创建空仓库 `light-fit-checkin`，不要让 GitHub自动创建 README、`.gitignore` 或 License。

安装 Git for Windows 并重新打开 PowerShell，然后执行：

```powershell
cd 'C:\Users\Ltc\Documents\--'
git init
git branch -M main
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
git add .
git status
git commit -m "Initial commit: light fit check-in"
git remote add origin https://github.com/你的用户名/light-fit-checkin.git
git push -u origin main
```

`git status` 中不能出现 `.env`、`.env.local`、`node_modules`、`dist` 或日志文件。GitHub 推送时使用 Git Credential Manager 的浏览器授权，不能使用账户密码。

如果远程地址已经存在：

```powershell
git remote set-url origin https://github.com/你的用户名/light-fit-checkin.git
git push -u origin main
```

## Cloudflare Pages 导入 GitHub

1. 登录 https://dash.cloudflare.com。
2. 进入 **Workers & Pages**。
3. 点击 **Create application → Pages → Import an existing Git repository**。
4. 授权 GitHub，选择 `light-fit-checkin`，点击 **Begin setup**。
5. 使用以下配置：

```text
Project name: light-fit-checkin（可修改，决定 pages.dev 地址）
Production branch: main
Framework preset: Vue（没有 Vue 时选 Vite）
Build command: npm run build
Build output directory: dist
Root directory: /
```

6. 在构建前配置 Production 和 Preview 环境变量：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

只使用 Supabase Project URL 与 anon/publishable key。严禁使用 `service_role`、secret key 或数据库密码。

7. 点击 **Save and Deploy**。

## Supabase 正式地址

部署后会得到类似：

```text
https://light-fit-checkin.pages.dev
```

进入 Supabase Dashboard → Authentication → URL Configuration：

```text
Site URL: https://light-fit-checkin.pages.dev
Redirect URLs:
https://light-fit-checkin.pages.dev/**
http://localhost:5173/**
```

保存后，在 Cloudflare Pages 中触发一次新部署或重新部署。

## 查看公网地址

进入 Cloudflare Dashboard → Workers & Pages → `light-fit-checkin` → Deployments。Production 部署卡片和项目顶部都会显示正式的 `*.pages.dev` 地址。

## 部署后验证

1. 手机关闭 Wi-Fi，使用移动网络打开 `pages.dev` 地址。
2. 使用管理员或普通用户账号登录。
3. 提交今日打卡，看到成功提示。
4. 刷新页面并重新进入历史记录，确认记录仍存在。
5. 打开体重趋势和排行榜。
6. 分别测试微信内置浏览器与手机系统浏览器。

## 常见错误

- **Build failed**：本地先运行 `npm.cmd run build`，检查 Cloudflare 的首条构建错误。
- **环境变量缺失**：进入 Pages 项目 → Settings → Variables and Secrets，同时配置 Production 和 Preview，然后重新部署。
- **Invalid API key**：Supabase URL 和 publishable key 必须来自同一项目。
- **刷新子页面 404**：确认仓库存在 `public/_redirects`，构建日志结束后产物中应有 `dist/_redirects`。
- **登录失败**：确认 Supabase Auth 用户已创建并 Auto Confirm，Site URL 已换成 `pages.dev` 地址。
- **RLS 拒绝提交**：用户必须已经加入活动，普通用户只能提交中国时区当天记录。
- **部署成功但白屏**：检查 Pages Deployment 日志以及浏览器控制台的第一条错误。
- **微信打不开**：先用移动网络在系统浏览器验证；确认使用 HTTPS `pages.dev` 地址，不要发送 `localhost` 或 `127.0.0.1`。
