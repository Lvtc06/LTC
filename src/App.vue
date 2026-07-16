<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const active = computed(() => route.path)
</script>
<template>
  <main class="app-shell"><RouterView /></main>
  <van-tabbar v-if="route.path !== '/login'" :model-value="active" route safe-area-inset-bottom>
    <van-tabbar-item to="/" name="/" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/history" name="/history" icon="notes-o">记录</van-tabbar-item>
    <van-tabbar-item to="/ranking" name="/ranking" icon="bar-chart-o">排行</van-tabbar-item>
    <van-tabbar-item to="/profile" name="/profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>
