-- 轻盈打卡：在 Supabase SQL Editor 中一次执行。所有业务日期均按 Asia/Shanghai 解释。
create extension if not exists pgcrypto;

create type public.user_role as enum ('user','admin');
create type public.user_status as enum ('active','disabled');
create type public.activity_status as enum ('draft','active','ended');
create type public.meal_status as enum ('正常','少吃','未吃','超量');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 2 and 50),
  nickname text not null check (char_length(nickname) between 1 and 50),
  initial_weight numeric(5,2) not null check (initial_weight > 0),
  target_weight numeric(5,2) not null check (target_weight > 0),
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activities (
  id bigint generated always as identity primary key,
  activity_name text not null check (char_length(activity_name) between 1 and 100),
  start_date date not null, end_date date not null, target_loss numeric(5,2) check (target_loss is null or target_loss >= 0),
  status public.activity_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint valid_activity_dates check (end_date >= start_date)
);
create table public.activity_users (
  id bigint generated always as identity primary key,
  activity_id bigint not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  initial_weight numeric(5,2) not null check (initial_weight > 0), target_weight numeric(5,2) not null check (target_weight > 0),
  joined_at timestamptz not null default now(), unique(activity_id,user_id)
);
create table public.daily_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_id bigint not null references public.activities(id) on delete cascade,
  record_date date not null, weight numeric(5,2) not null check(weight > 0),
  breakfast_status public.meal_status not null, lunch_status public.meal_status not null, dinner_status public.meal_status not null,
  exercised boolean not null default false, exercise_type text not null default '', exercise_minutes integer not null default 0 check(exercise_minutes >= 0),
  water_ml integer not null default 0 check(water_ml >= 0), sleep_hours numeric(4,2) not null default 0 check(sleep_hours between 0 and 24),
  completed boolean not null default false, remark text not null default '' check(char_length(remark)<=500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint one_record_per_day unique(user_id,activity_id,record_date)
);
create index idx_daily_user_activity_date on public.daily_records(user_id,activity_id,record_date desc);
create index idx_daily_activity_date on public.daily_records(activity_id,record_date desc);
create index idx_activity_users_user on public.activity_users(user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger activities_updated before update on public.activities for each row execute function public.set_updated_at();
create trigger records_updated before update on public.daily_records for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and status='active') $$;
revoke all on function public.is_admin() from public; grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security; alter table public.activities enable row level security; alter table public.activity_users enable row level security; alter table public.daily_records enable row level security;
create policy profiles_select_self_or_admin on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profiles_admin_update on public.profiles for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy activities_read_members on public.activities for select to authenticated using(public.is_admin() or exists(select 1 from public.activity_users au where au.activity_id=id and au.user_id=auth.uid()));
create policy activities_admin_all on public.activities for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy memberships_read_self_or_admin on public.activity_users for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy memberships_admin_all on public.activity_users for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy records_select_self_or_admin on public.daily_records for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy records_insert_today on public.daily_records for insert to authenticated with check(user_id=auth.uid() and record_date=(now() at time zone 'Asia/Shanghai')::date and exists(select 1 from public.activity_users au where au.activity_id=daily_records.activity_id and au.user_id=auth.uid()));
create policy records_update_today_or_admin on public.daily_records for update to authenticated using(public.is_admin() or (user_id=auth.uid() and record_date=(now() at time zone 'Asia/Shanghai')::date)) with check(public.is_admin() or (user_id=auth.uid() and record_date=(now() at time zone 'Asia/Shanghai')::date));
create policy records_admin_delete on public.daily_records for delete to authenticated using(public.is_admin());

-- 排行榜只返回公开汇总，不泄露其他人的逐日记录。
create or replace function public.get_activity_leaderboard(p_activity_id bigint)
returns table(user_id uuid,nickname text,initial_weight numeric,current_weight numeric,total_loss numeric,loss_rate numeric,checkin_days bigint,streak_days bigint,checked_today boolean)
language sql stable security definer set search_path='' as $$
with allowed as (select 1 where public.is_admin() or exists(select 1 from public.activity_users where activity_id=p_activity_id and user_id=auth.uid())),
base as (select au.user_id,p.nickname,au.initial_weight,coalesce((select dr.weight from public.daily_records dr where dr.user_id=au.user_id and dr.activity_id=au.activity_id order by dr.record_date desc limit 1),au.initial_weight) current_weight,(select count(distinct dr.record_date) from public.daily_records dr where dr.user_id=au.user_id and dr.activity_id=au.activity_id) checkin_days,exists(select 1 from public.daily_records dr where dr.user_id=au.user_id and dr.activity_id=au.activity_id and dr.record_date=(now() at time zone 'Asia/Shanghai')::date) checked_today from public.activity_users au join public.profiles p on p.id=au.user_id,allowed where au.activity_id=p_activity_id and p.status='active'),
streaks as (select b.user_id,count(*) streak_days from base b join lateral (select d.record_date,row_number() over(order by d.record_date desc) rn from public.daily_records d where d.user_id=b.user_id and d.activity_id=p_activity_id and d.record_date<=((now() at time zone 'Asia/Shanghai')::date-case when b.checked_today then 0 else 1 end) order by d.record_date desc) x on x.record_date=((now() at time zone 'Asia/Shanghai')::date-case when b.checked_today then 0 else 1 end)-(x.rn::int-1) group by b.user_id)
select b.user_id,b.nickname,b.initial_weight,b.current_weight,round(b.initial_weight-b.current_weight,2),round((b.initial_weight-b.current_weight)/b.initial_weight*100,2),b.checkin_days,coalesce(s.streak_days,0),b.checked_today from base b left join streaks s using(user_id) order by 5 desc;
$$;
revoke all on function public.get_activity_leaderboard(bigint) from public; grant execute on function public.get_activity_leaderboard(bigint) to authenticated;

-- 新建 Auth 用户后自动补 profiles；username/nickname/体重来自 user_metadata。
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,username,nickname,initial_weight,target_weight) values(new.id,coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)),coalesce(new.raw_user_meta_data->>'nickname',split_part(new.email,'@',1)),coalesce((new.raw_user_meta_data->>'initial_weight')::numeric,70),coalesce((new.raw_user_meta_data->>'target_weight')::numeric,60));return new;end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
