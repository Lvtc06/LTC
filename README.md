# 轻盈打卡

面向约 10 人小型熟人减肥活动的手机端打卡网页。Vue 3 + Vite + Vant + Pinia + ECharts，登录、数据和权限由 Supabase 提供，静态网页通过 GitHub Pages 免费部署。

## 已包含功能

- 账号密码登录、登录状态保持、退出、修改密码
- 首页活动概览、今日状态、体重与连续打卡指标
- 每日打卡新增/当天修改与完整字段校验
- 历史记录、日期范围筛选、体重趋势与目标参考线
- 支持减重、减重比例、打卡天数、连续天数排序的汇总排行榜
- 管理员用户状态、全员记录、删除错误记录、活动设置、CSV 导出
- PostgreSQL 表、索引、约束、触发器、RLS 和安全汇总函数

## 1. 本地启动（Windows）

需要 Node.js 20.19+ 或 22.12+。在项目目录打开 PowerShell：

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

按终端显示的地址打开网页。首次运行前请填写 `.env`：

```env
VITE_SUPABASE_URL=https://你的项目编号.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名公钥
```

匿名公钥可以出现在前端；绝对不要填写 `service_role` key，也不要提交 `.env`。

## 2. 创建和配置 Supabase

1. 在 Supabase 创建免费项目。
2. 打开 SQL Editor，复制并执行 `supabase/schema.sql` 全部内容。
3. 在 Project Settings → API 复制 Project URL 和 anon public key 到 `.env`。
4. Authentication → Providers → Email：保持 Email provider 开启；关闭 Confirm email（这是管理员预建账号的封闭小组）。
5. Authentication → URL Configuration：本地加入 `http://localhost:5173/**`，上线后加入 Cloudflare Pages 的 `pages.dev` 域名。

RLS 已强制：普通用户只能读取本人资料和本人逐日记录，只能新增/修改中国时区的当天记录；排行榜通过安全函数仅返回汇总；管理员敏感操作由数据库角色判断，不依赖前端按钮。

## 3. 创建管理员与用户

在 Supabase Dashboard 的 Authentication → Users 点击 Add user。推荐用以下形式创建：

- 登录账号 `xiaoming` 对应 Auth 邮箱 `xiaoming@lightfit.local`
- 密码由管理员临时设置，首次登录后用户在“个人中心”修改
- 勾选 Auto Confirm User

创建后，触发器会自动产生 `profiles`。然后在 SQL Editor 设置资料：

```sql
update public.profiles
set nickname='活动管理员', initial_weight=70, target_weight=62, role='admin'
where username='admin';

update public.profiles
set nickname='小明', initial_weight=78.5, target_weight=70
where username='xiaoming';
```

管理员在网页“管理后台”创建活动后，用 SQL 将成员加入活动（也可批量执行）：

```sql
insert into public.activity_users(activity_id,user_id,initial_weight,target_weight)
select 1,id,initial_weight,target_weight from public.profiles
on conflict(activity_id,user_id) do nothing;
```

说明：浏览器端不能安全持有 Service Role Key，所以第一版账号创建保留在 Supabase Dashboard；这是安全设计，不是功能缺失。

## 4. 测试账号配置

建议至少创建：`admin@lightfit.local`（admin）、`user01@lightfit.local`（user）和 `user02@lightfit.local`（user）。逐项验证：

1. 普通用户不能打开 `/admin`。
2. 普通用户看不到他人详细记录，但能看到排行榜汇总。
3. 普通用户不能修改历史记录。
4. 同一用户、活动、日期重复提交只更新同一条记录。
5. 管理员可以读取和删除全员记录并导出 CSV。

不要把真实测试密码写入源码、README 或 Git。

## 5. 部署到 GitHub Pages

1. 仓库 Settings → Pages 的 Source 选择 GitHub Actions。
2. 仓库 Actions Secrets 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
3. 推送到 `main` 后，工作流自动构建并发布 `dist`。
4. 把 `https://lvtc06.github.io/LTC/` 加入 Supabase Authentication 的 Site URL 与 Redirect URLs。

项目使用 Hash 路由，刷新子页面不会 404。完整步骤见 `DEPLOYMENT.md`。

## 常见问题

- **提示未配置 Supabase**：检查 `.env` 名称和两个变量，修改后重启开发服务。
- **账号或密码错误**：后台确认用户存在、已 Auto Confirm，登录名会自动转换为 `账号@lightfit.local`。
- **登录后加载失败**：确认已执行完整 SQL，且该 Auth 用户拥有 `profiles` 记录。
- **首页提示无活动**：需要建立活动并向 `activity_users` 加入该用户。
- **权限 denied / RLS**：确认 `profiles.role` 正确；不要关闭 RLS 规避问题。
- **排行榜无数据**：用户必须已加入同一活动；函数只对活动成员或管理员返回结果。
- **Windows 禁止 npm.ps1**：使用 `npm.cmd`，无需修改系统执行策略。
- **GitHub Pages 资源 404**：确认生产基础路径为 `/LTC/`，并重新运行 Actions。

## 项目结构

```text
src/
  components/   公共组件
  router/       路由与登录/管理员守卫
  services/     Supabase 客户端与数据请求
  stores/       登录状态与用户资料
  types/        TypeScript 数据类型
  utils/        中国时区日期与业务计算
  views/        登录、首页、打卡、历史、趋势、排行、个人、管理页面
supabase/schema.sql  建表、索引、约束、RLS 和排行榜函数
.env.example         环境变量模板
.github/workflows/   GitHub Pages 自动部署工作流
```
