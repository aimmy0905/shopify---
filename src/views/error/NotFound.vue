<template>
  <div class="not-found-container">
    <div class="error-card">
      <div class="error-icon">
        <el-icon size="120">
          <DocumentRemove />
        </el-icon>
      </div>
      
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">页面不存在</h2>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被删除。
      </p>
      
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          回到首页
        </el-button>
        <el-button @click="goBack">
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { DocumentRemove } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped lang="scss">
.not-found-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-card {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 30px;
  color: #e6a23c;
}

.error-title {
  font-size: 72px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.error-subtitle {
  font-size: 24px;
  font-weight: 500;
  color: #666;
  margin-bottom: 20px;
}

.error-description {
  color: #999;
  line-height: 1.6;
  margin-bottom: 40px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  
  .el-button {
    padding: 12px 24px;
  }
}

@media (max-width: 768px) {
  .error-card {
    margin: 20px;
    padding: 40px 20px;
  }
  
  .error-title {
    font-size: 60px;
  }
  
  .error-subtitle {
    font-size: 20px;
  }
  
  .error-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style> 