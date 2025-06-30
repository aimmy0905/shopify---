<template>
  <div id="app">
    <StagewiseToolbar :config="stageWiseConfig" />
    <router-view />
  </div>
</template>

<script setup>
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import { VuePlugin } from '@stagewise-plugins/vue'

// Configure stagewise toolbar for development mode
const stageWiseConfig = {
  plugins: [VuePlugin]
}
</script>

<style>
/* 全局样式已在 main.js 中引入，这里只保留 app 容器的基础样式 */
#app {
  min-height: 100vh;
}
</style>
