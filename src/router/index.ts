import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/checkin', component: () => import('../views/CheckinView.vue') },
  { path: '/history', component: () => import('../views/HistoryView.vue') },
  { path: '/trend', component: () => import('../views/TrendView.vue') },
  { path: '/ranking', component: () => import('../views/RankingView.vue') },
  { path: '/profile', component: () => import('../views/ProfileView.vue') },
  { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { admin: true } },
]
// Hash 路由适合 GitHub Pages：直接刷新子页面也不会请求不存在的服务器路径。
export const router = createRouter({ history: createWebHashHistory(), routes })
router.beforeEach(async to => { const auth = useAuthStore(); if (!auth.ready) { try { await auth.restore() } catch { auth.ready = true } } if (!to.meta.public && !auth.user) return '/login'; if (to.meta.admin && !auth.isAdmin) return '/'; if (to.path === '/login' && auth.user) return '/'; return true })
