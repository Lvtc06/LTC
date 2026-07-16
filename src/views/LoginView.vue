<script setup lang="ts">
import { ref } from 'vue'
import { showFailToast } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { isConfigured } from '../services/supabase'

const account = ref('')
const password = ref('')
const loading = ref(false)
const auth = useAuthStore()
const router = useRouter()

function friendlyMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (/invalid login credentials/i.test(message)) return '账号或密码错误'
  if (/email not confirmed/i.test(message)) return '账号尚未确认，请联系管理员'
  if (/failed to fetch|network/i.test(message)) return '网络连接失败，请稍后重试'
  return message || '登录失败，请稍后重试'
}

async function submit() {
  if (loading.value) return
  const username = account.value.trim()
  const secret = password.value.trim()
  if (!username) return showFailToast('请输入账号')
  if (!secret) return showFailToast('请输入密码')
  if (!isConfigured) return showFailToast('系统尚未配置 Supabase')

  loading.value = true
  try {
    await auth.login(username, secret)
    await router.replace('/')
  } catch (error) {
    showFailToast(friendlyMessage(error))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="brand-mark">↘</div>
    <div class="eyebrow">LIGHT FIT · 每日一点改变</div>
    <h1>轻盈打卡</h1>
    <p class="lead">和熟悉的人一起，把坚持变成看得见的进步。</p>

    <form class="card login-card native-login-form" @submit.prevent="submit">
      <label for="login-account">账号</label>
      <input id="login-account" v-model="account" name="username" type="text" inputmode="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="请输入账号" />

      <label for="login-password">密码</label>
      <input id="login-password" v-model="password" name="password" type="password" autocomplete="current-password" placeholder="请输入密码" />

      <button class="primary-btn login-submit" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>
    </form>

    <p class="muted" style="text-align:center">账号由活动管理员统一创建 · 版本 3</p>
  </section>
</template>

<style scoped>
.native-login-form { display: flex; flex-direction: column; gap: 10px; }
.native-login-form label { margin-top: 4px; font-size: 14px; font-weight: 700; }
.native-login-form input { width: 100%; height: 50px; padding: 0 14px; border: 1px solid var(--line); border-radius: 13px; outline: none; background: #f8faf7; color: var(--ink); font: inherit; font-size: 16px; -webkit-appearance: none; }
.native-login-form input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(31, 118, 92, .1); }
.login-submit { margin-top: 12px; }
.login-submit:disabled { opacity: .65; }
</style>
