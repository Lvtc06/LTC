import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { getProfile } from '../services/api'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as User | null, profile: null as Profile | null, ready: false }),
  getters: { isAdmin: state => state.profile?.role === 'admin' },
  actions: {
    async restore() { const { data } = await supabase.auth.getSession(); this.user = data.session?.user || null; if (this.user) this.profile = await getProfile(this.user.id); this.ready = true },
    async login(account: string, password: string) { const email = account.includes('@') ? account : `${account}@lightfit.local`; const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; this.user = data.user; this.profile = await getProfile(data.user.id) },
    async logout() { await supabase.auth.signOut(); this.user = null; this.profile = null },
    async changePassword(password: string) { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error },
  },
})
