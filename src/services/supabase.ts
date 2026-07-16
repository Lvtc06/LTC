import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// 部署平台中有时会误填 REST endpoint（.../rest/v1/）。
// Supabase 客户端需要项目根地址，否则认证请求会错误地变成 /rest/v1/auth/v1/token。
const url = rawUrl?.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '')

export const isConfigured = Boolean(url && key)
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
