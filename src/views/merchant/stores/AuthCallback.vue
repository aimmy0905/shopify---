<template>
  <div class="auth-callback">
    <div class="callback-container">
      <!-- 加载状态 -->
      <div v-if="processing" class="processing-state">
        <el-icon class="loading-icon" size="48">
          <Loading />
        </el-icon>
        <h2>正在处理授权信息...</h2>
        <p>请稍候，我们正在完成店铺连接。</p>
        <div class="progress-steps">
          <div class="progress-step" :class="{ active: currentStep >= 1 }">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>验证授权信息</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 2 }">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>获取访问令牌</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 3 }">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>同步店铺信息</span>
          </div>
          <div class="progress-step" :class="{ active: currentStep >= 4 }">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>完成连接</span>
          </div>
        </div>
      </div>

      <!-- 成功状态 -->
      <div v-else-if="success" class="success-state">
        <el-icon class="success-icon" size="64" color="#67c23a">
          <CircleCheckFilled />
        </el-icon>
        <h2>店铺授权成功！</h2>
        <p>{{ storeInfo.name || storeInfo.domain }} 已成功连接到您的账户。</p>
        <div class="store-info-card">
          <div class="store-detail">
            <div class="detail-item">
              <span class="label">店铺名称：</span>
              <span class="value">{{ storeInfo.name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">店铺域名：</span>
              <span class="value">{{ storeInfo.domain }}</span>
            </div>
            <div class="detail-item">
              <span class="label">授权时间：</span>
              <span class="value">{{ formatDate(new Date()) }}</span>
            </div>
          </div>
        </div>
        <div class="success-actions">
          <el-button type="primary" size="large" @click="goToStoreList">
            查看我的店铺
          </el-button>
          <el-button size="large" @click="goToStoreDetail">
            进入店铺详情
          </el-button>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-icon class="error-icon" size="64" color="#f56c6c">
          <CircleCloseFilled />
        </el-icon>
        <h2>授权失败</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="error-details" v-if="errorDetails">
          <el-alert
            :title="errorDetails.title || '错误详情'"
            :description="errorDetails.description"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
        <div class="error-actions">
          <el-button type="primary" @click="retryAuthorization">
            重新授权
          </el-button>
          <el-button @click="goToStoreList">
            返回店铺列表
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Loading,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const processing = ref(true)
const success = ref(false)
const error = ref(false)
const currentStep = ref(0)
const storeInfo = ref({})
const errorMessage = ref('')
const errorDetails = ref(null)

// 处理授权回调
const handleAuthCallback = async () => {
  try {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const errorParam = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    // 检查是否有错误参数
    if (errorParam) {
      throw new Error(errorDescription || `授权被拒绝: ${errorParam}`)
    }

    // 检查必要参数
    if (!code || !state) {
      throw new Error('缺少必要的授权参数')
    }

    // 解析state参数
    let stateData
    try {
      stateData = JSON.parse(decodeURIComponent(state))
    } catch (e) {
      throw new Error('授权状态参数格式错误')
    }

    // 步骤1: 验证授权信息
    currentStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 800))

    // 步骤2: 获取访问令牌
    currentStep.value = 2
    const tokenResponse = await exchangeCodeForToken(code, stateData.shopDomain)
    await new Promise(resolve => setTimeout(resolve, 800))

    // 步骤3: 同步店铺信息
    currentStep.value = 3
    const shopInfo = await fetchShopInfo(tokenResponse.access_token, stateData.shopDomain)
    await new Promise(resolve => setTimeout(resolve, 800))

    // 步骤4: 完成连接
    currentStep.value = 4
    await saveStoreInfo({
      ...shopInfo,
      access_token: tokenResponse.access_token,
      custom_name: stateData.shopName
    })
    await new Promise(resolve => setTimeout(resolve, 500))

    // 设置成功状态
    storeInfo.value = {
      name: stateData.shopName || shopInfo.name,
      domain: `${stateData.shopDomain}.myshopify.com`,
      id: shopInfo.id
    }
    
    processing.value = false
    success.value = true

    // 显示成功通知
    ElNotification({
      title: '授权成功',
      message: `店铺 ${storeInfo.value.name} 已成功连接！`,
      type: 'success',
      duration: 3000
    })

  } catch (err) {
    console.error('授权处理失败:', err)
    
    processing.value = false
    error.value = true
    errorMessage.value = err.message || '授权过程中发生未知错误'
    
    // 设置详细错误信息
    if (err.code === 'INVALID_SHOP') {
      errorDetails.value = {
        title: '店铺验证失败',
        description: '请检查店铺域名是否正确，或者店铺是否处于正常状态。'
      }
    } else if (err.code === 'TOKEN_EXCHANGE_FAILED') {
      errorDetails.value = {
        title: '令牌获取失败',
        description: '授权码可能已过期或无效，请重新进行授权。'
      }
    } else if (err.code === 'NETWORK_ERROR') {
      errorDetails.value = {
        title: '网络连接错误',
        description: '请检查网络连接后重试。'
      }
    }

    // 显示错误通知
    ElNotification({
      title: '授权失败',
      message: errorMessage.value,
      type: 'error',
      duration: 5000
    })
  }
}

// 交换授权码获取访问令牌
const exchangeCodeForToken = async (code, shopDomain) => {
  // 这里应该调用后端API来交换访问令牌
  // 为了演示，这里使用模拟数据
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟API调用
      if (Math.random() > 0.1) { // 90% 成功率
        resolve({
          access_token: 'shpat_' + Math.random().toString(36).substr(2, 32),
          scope: 'read_products,write_products,read_orders,read_customers'
        })
      } else {
        const error = new Error('令牌获取失败')
        error.code = 'TOKEN_EXCHANGE_FAILED'
        reject(error)
      }
    }, 1000)
  })
}

// 获取店铺信息
const fetchShopInfo = async (accessToken, shopDomain) => {
  // 这里应该调用Shopify API获取店铺信息
  // 为了演示，这里使用模拟数据
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.05) { // 95% 成功率
        resolve({
          id: Math.floor(Math.random() * 1000000),
          name: shopDomain.charAt(0).toUpperCase() + shopDomain.slice(1) + ' Store',
          domain: `${shopDomain}.myshopify.com`,
          email: `admin@${shopDomain}.com`,
          currency: 'USD',
          timezone: 'America/New_York'
        })
      } else {
        const error = new Error('店铺信息获取失败')
        error.code = 'SHOP_INFO_FAILED'
        reject(error)
      }
    }, 1000)
  })
}

// 保存店铺信息到数据库
const saveStoreInfo = async (storeData) => {
  // 这里应该调用后端API保存店铺信息
  // 为了演示，这里使用模拟保存
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.02) { // 98% 成功率
        resolve({ success: true, storeId: Math.floor(Math.random() * 1000) })
      } else {
        const error = new Error('店铺信息保存失败')
        error.code = 'SAVE_FAILED'
        reject(error)
      }
    }, 800)
  })
}

// 方法
const goToStoreList = () => {
  router.push('/merchant/stores')
}

const goToStoreDetail = () => {
  if (storeInfo.value.id) {
    router.push(`/merchant/stores/${storeInfo.value.id}`)
  } else {
    goToStoreList()
  }
}

const retryAuthorization = () => {
  router.push('/merchant/stores/authorize')
}

const formatDate = (date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  handleAuthCallback()
})
</script>

<style lang="scss" scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;

  .callback-container {
    max-width: 600px;
    width: 100%;
    background: white;
    border-radius: 16px;
    padding: 48px 32px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  // 处理中状态
  .processing-state {
    .loading-icon {
      animation: spin 2s linear infinite;
      color: #409eff;
      margin-bottom: 24px;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0 0 32px 0;
      font-size: 16px;
      color: #6b7280;
    }

    .progress-steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
      max-width: 300px;
      margin: 0 auto;

      .progress-step {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #9ca3af;
        transition: all 0.3s ease;

        &.active {
          color: #67c23a;
          
          .el-icon {
            color: #67c23a;
          }
        }

        .el-icon {
          color: #d1d5db;
          transition: color 0.3s ease;
        }
      }
    }
  }

  // 成功状态
  .success-state {
    .success-icon {
      margin-bottom: 24px;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0 0 32px 0;
      font-size: 16px;
      color: #6b7280;
    }

    .store-info-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      text-align: left;

      .store-detail {
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          &:last-child {
            margin-bottom: 0;
          }

          .label {
            font-weight: 500;
            color: #6b7280;
          }

          .value {
            font-weight: 600;
            color: #1f2937;
          }
        }
      }
    }

    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }

  // 错误状态
  .error-state {
    .error-icon {
      margin-bottom: 24px;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    .error-message {
      margin: 0 0 24px 0;
      font-size: 16px;
      color: #ef4444;
      font-weight: 500;
    }

    .error-details {
      margin-bottom: 32px;
      text-align: left;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .auth-callback {
    padding: 16px;

    .callback-container {
      padding: 32px 24px;
    }

    .success-actions,
    .error-actions {
      flex-direction: column;
    }
  }
}
</style> 