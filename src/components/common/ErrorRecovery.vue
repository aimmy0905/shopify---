<template>
  <div class="error-container">
    <el-card class="error-card">
      <div class="error-icon">
        <el-icon><WarningFilled /></el-icon>
      </div>
      <h2 class="error-title">{{ title || '加载失败' }}</h2>
      <p class="error-message">{{ message || '页面加载时发生错误，请尝试以下解决方法' }}</p>
      
      <div class="actions">
        <el-button type="primary" @click="reloadPage">
          <el-icon><RefreshRight /></el-icon>
          刷新页面
        </el-button>
        
        <el-button @click="clearCacheAndReload">
          <el-icon><Delete /></el-icon>
          清除缓存并刷新
        </el-button>
        
        <el-button type="info" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { WarningFilled, RefreshRight, Delete, HomeFilled } from '@element-plus/icons-vue';
import { clearAppCache } from '@/utils/cache';
import { useRouter } from 'vue-router';

const router = useRouter();

// 组件属性
const props = defineProps({
  // 错误标题
  title: {
    type: String,
    default: ''
  },
  // 错误消息
  message: {
    type: String,
    default: ''
  },
  // 错误代码 
  code: {
    type: String,
    default: ''
  }
});

// 刷新页面
const reloadPage = () => {
  window.location.reload();
};

// 清除缓存并刷新
const clearCacheAndReload = () => {
  clearAppCache();
  window.location.reload();
};

// 返回首页
const goHome = () => {
  router.push('/');
};
</script>

<style lang="scss" scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 60vh;
  padding: 20px;
}

.error-card {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: #e6a23c;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: #303133;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
</style> 