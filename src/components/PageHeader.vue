<script setup lang="ts">defineProps<{ title: string; eyebrow?: string; back?: boolean }>()</script>
<template><header class="page-head"><div><div v-if="eyebrow" class="eyebrow">{{ eyebrow }}</div><h1 class="title">{{ title }}</h1></div><van-icon v-if="back" name="arrow-left" size="24" @click="$router.back()" /></header></template>
