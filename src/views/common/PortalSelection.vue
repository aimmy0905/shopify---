<template>
  <div class="portal-selection">
    <div class="container">
      <div class="header">
        <img src="/logo.png" alt="Shopify铺货系统" class="logo">
        <h1>Shopify铺货系统</h1>
        <p class="subtitle">请选择您的登录方式</p>
      </div>
      
      <div class="portal-cards">
        <!-- 商家端入口 -->
        <div class="portal-card merchant" @click="goToMerchant">
          <div class="card-icon">
            <el-icon size="60"><Shop /></el-icon>
          </div>
          <h2>商家端</h2>
          <p>管理您的Shopify店铺、商品、订单</p>
          <ul class="features">
            <li>商品一键铺货</li>
            <li>订单管理</li>
            <li>余额管理</li>
            <li>佣金管理</li>
          </ul>
          <el-button type="primary" size="large" class="portal-btn">
            进入商家端
          </el-button>
        </div>
        
        <!-- 管理端入口 -->
        <div class="portal-card admin" @click="goToAdmin">
          <div class="card-icon">
            <el-icon size="60"><Setting /></el-icon>
          </div>
          <h2>管理端</h2>
          <p>平台管理、用户管理、系统设置</p>
          <ul class="features">
            <li>商家管理</li>
            <li>商品管理</li>
            <li>订单监控</li>
            <li>系统设置</li>
          </ul>
          <el-button type="success" size="large" class="portal-btn">
            进入管理端
          </el-button>
        </div>
      </div>
      
      <div class="footer">
        <p>&copy; 2024 Shopify铺货系统. 为您的电商业务提供专业解决方案</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Shop, Setting } from '@element-plus/icons-vue'

const router = useRouter()

// 清理之前的登录状态
const clearAuthState = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('userType')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('rememberMe')
  console.log('已清理所有认证状态')
}

// 进入商家端
const goToMerchant = () => {
  clearAuthState()
  router.push('/merchant/login')
}

// 进入管理端
const goToAdmin = () => {
  clearAuthState()
  router.push('/admin/login')
}
</script>

<style scoped>
.portal-selection {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 1000px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: white;
  padding: 10px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 300;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.portal-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.portal-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.portal-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.portal-card.merchant {
  border-top: 4px solid #409eff;
}

.portal-card.admin {
  border-top: 4px solid #67c23a;
}

.card-icon {
  margin-bottom: 20px;
  color: #666;
}

.portal-card.merchant .card-icon {
  color: #409eff;
}

.portal-card.admin .card-icon {
  color: #67c23a;
}

.portal-card h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
}

.portal-card p {
  color: #666;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
  text-align: left;
}

.features li {
  padding: 8px 0;
  color: #666;
  position: relative;
  padding-left: 20px;
}

.features li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}

.portal-btn {
  width: 100%;
  border-radius: 25px;
  height: 50px;
  font-size: 1.1rem;
  font-weight: 500;
}

.footer {
  text-align: center;
  color: white;
  opacity: 0.8;
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portal-cards {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .portal-card {
    padding: 30px 20px;
  }
  
  .container {
    padding: 0;
  }
}
</style> 