<template>
  <div class="not-found">
    <div class="container">
      <div class="error-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面不存在</h2>
        <p class="error-message">抱歉，您访问的页面不存在或已被移除。</p>
        <div class="actions">
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="goBack">返回上页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.container {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  color: #333;
  margin: 20px 0 10px 0;
}

.error-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 