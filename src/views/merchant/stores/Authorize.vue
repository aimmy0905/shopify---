<template>
  <div class="authorize-store">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item>
        <router-link to="/merchant/stores">我的店铺</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>授权新店铺</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1>授权 Shopify 店铺</h1>
      <p class="page-description">
        通过 Shopify 官方授权流程，安全快速地连接您的店铺。授权后我们将获得必要的权限来帮助您管理商品和订单。
      </p>
    </div>

    <!-- 授权流程说明 -->
    <div class="auth-flow-info">
      <el-card class="flow-card">
        <div class="flow-header">
          <el-icon size="32" color="#409eff"><Key /></el-icon>
          <h3>授权流程说明</h3>
        </div>
        <div class="flow-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>输入店铺信息</h4>
              <p>输入您的 Shopify 店铺域名</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>跳转授权页面</h4>
              <p>系统将跳转到 Shopify 官方授权页面</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>确认授权</h4>
              <p>在 Shopify 页面确认授权我们的应用</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>完成连接</h4>
              <p>授权成功后自动返回并完成店铺连接</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 授权表单 -->
    <div class="auth-form">
      <el-card>
        <template #header>
          <div class="form-header">
            <el-icon><Shop /></el-icon>
            <span>店铺授权信息</span>
          </div>
        </template>

        <el-form
          ref="authFormRef"
          :model="authForm"
          :rules="formRules"
          label-width="120px"
          size="large"
        >
          <el-form-item label="店铺域名" prop="shopDomain">
            <el-input
              v-model="authForm.shopDomain"
              placeholder="请输入您的 Shopify 店铺域名"
              :prefix-icon="Shop"
            >
              <template #suffix>
                <span class="domain-suffix">.myshopify.com</span>
              </template>
            </el-input>
            <div class="form-help">
              <el-icon><InfoFilled /></el-icon>
              <span>例如：your-store-name（不包含 .myshopify.com）</span>
            </div>
          </el-form-item>

          <el-form-item label="店铺名称" prop="shopName">
            <el-input
              v-model="authForm.shopName"
              placeholder="为您的店铺设置一个易记的名称（可选）"
              :prefix-icon="EditPen"
            />
            <div class="form-help">
              <el-icon><InfoFilled /></el-icon>
              <span>此名称仅用于系统内显示，如不填写将使用店铺域名</span>
            </div>
          </el-form-item>

          <el-form-item label="授权权限">
            <div class="permissions-info">
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>读取店铺基本信息</span>
              </div>
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>读取和管理商品</span>
              </div>
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>读取订单信息</span>
              </div>
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>读取客户信息</span>
              </div>
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>管理库存和履行</span>
              </div>
            </div>
            <div class="permissions-note">
              <el-alert
                title="权限说明"
                type="info"
                show-icon
                :closable="false"
              >
                <template #default>
                  我们仅请求必要的权限来提供服务。您可以在 Shopify 管理后台随时查看和撤销授权。
                </template>
              </el-alert>
            </div>
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button size="large" @click="goBack">
                取消
              </el-button>
              <el-button
                type="primary"
                size="large"
                @click="handleAuthorize"
                :loading="authorizing"
              >
                <el-icon v-if="!authorizing"><Key /></el-icon>
                {{ authorizing ? '正在跳转授权页面...' : '开始授权' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 安全保障 -->
    <div class="security-section">
      <el-card>
        <template #header>
          <div class="security-header">
            <el-icon><Lock /></el-icon>
            <span>安全保障</span>
          </div>
        </template>

        <div class="security-content">
          <div class="security-item">
            <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
            <div class="security-text">
              <h4>官方授权流程</h4>
              <p>使用 Shopify 官方 OAuth 2.0 授权标准，确保授权过程安全可靠</p>
            </div>
          </div>
          <div class="security-item">
            <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
            <div class="security-text">
              <h4>数据加密传输</h4>
              <p>所有数据传输均采用 HTTPS 加密，保护您的店铺信息安全</p>
            </div>
          </div>
          <div class="security-item">
            <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
            <div class="security-text">
              <h4>最小权限原则</h4>
              <p>仅申请必要的权限，绝不过度获取您的店铺数据</p>
            </div>
          </div>
          <div class="security-item">
            <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
            <div class="security-text">
              <h4>随时可撤销</h4>
              <p>您可以随时在 Shopify 管理后台撤销我们的应用授权</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 常见问题 -->
    <div class="faq-section">
      <el-card>
        <template #header>
          <div class="faq-header">
            <el-icon><QuestionFilled /></el-icon>
            <span>常见问题</span>
          </div>
        </template>

        <el-collapse v-model="activeFaq">
          <el-collapse-item title="授权和添加店铺有什么区别？" name="1">
            <p>
              <strong>授权新店铺</strong>：直接通过 Shopify 官方授权流程连接店铺，更快速安全。<br>
              <strong>添加店铺</strong>：需要手动输入更多信息，适合需要自定义设置的情况。<br>
              推荐使用授权方式，更加便捷可靠。
            </p>
          </el-collapse-item>

          <el-collapse-item title="授权后会获得哪些权限？" name="2">
            <p>
              我们会获得以下权限：读取店铺基本信息、管理商品、读取订单、读取客户信息、管理库存。
              这些权限都是为了提供完整的铺货和订单管理服务所必需的。
            </p>
          </el-collapse-item>

          <el-collapse-item title="如何撤销授权？" name="3">
            <p>
              您可以在 Shopify 管理后台的 "应用" 部分找到我们的应用，点击 "卸载" 即可撤销授权。
              撤销后我们将无法访问您的店铺数据。
            </p>
          </el-collapse-item>

          <el-collapse-item title="授权失败怎么办？" name="4">
            <p>
              请检查：1) 店铺域名是否正确；2) 店铺是否处于正常状态；3) 网络连接是否稳定。
              如果问题持续存在，请联系我们的客服团队。
            </p>
          </el-collapse-item>

          <el-collapse-item title="可以同时授权多个店铺吗？" name="5">
            <p>
              是的，您可以授权多个 Shopify 店铺。每个店铺的授权都是独立的，
              互不影响。在店铺列表中可以管理所有已授权的店铺。
            </p>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Key,
  Shop,
  InfoFilled,
  EditPen,
  Select,
  Lock,
  CircleCheckFilled,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const authorizing = ref(false)
const activeFaq = ref(['1'])
const authFormRef = ref()

// 表单数据
const authForm = reactive({
  shopDomain: '',
  shopName: ''
})

// 表单验证规则
const formRules = {
  shopDomain: [
    { required: true, message: '请输入店铺域名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/,
      message: '店铺域名格式不正确',
      trigger: 'blur'
    }
  ]
}

// 方法
const goBack = () => {
  router.go(-1)
}

const handleAuthorize = async () => {
  if (!authFormRef.value) return
  
  try {
    // 验证表单
    await authFormRef.value.validate()
    
    authorizing.value = true
    
    // 构建 Shopify OAuth 授权 URL
    const shopDomain = authForm.shopDomain.trim()
    const fullDomain = `${shopDomain}.myshopify.com`
    
    // 这些参数需要根据您的 Shopify 应用配置进行调整
    const clientId = 'your_shopify_app_client_id' // 需要替换为实际的 Client ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/merchant/stores/auth-callback`)
    const scope = encodeURIComponent('read_products,write_products,read_orders,read_customers,read_inventory,write_inventory')
    const state = encodeURIComponent(JSON.stringify({
      shopDomain: shopDomain,
      shopName: authForm.shopName || shopDomain,
      timestamp: Date.now()
    }))
    
    const authUrl = `https://${fullDomain}/admin/oauth/authorize?` +
      `client_id=${clientId}&` +
      `scope=${scope}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${state}&` +
      `response_type=code`
    
    // 显示提示信息
    ElNotification({
      title: '正在跳转授权页面',
      message: '即将跳转到 Shopify 官方授权页面，请在新页面中确认授权。',
      type: 'info',
      duration: 3000
    })
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      // 跳转到 Shopify 授权页面
      window.location.href = authUrl
    }, 1000)
    
  } catch (error) {
    console.error('授权失败:', error)
    ElMessage.error('授权失败，请检查店铺域名是否正确')
  } finally {
    // 注意：由于会跳转页面，这里的 finally 可能不会执行
    // 但为了代码完整性还是保留
    setTimeout(() => {
      authorizing.value = false
    }, 2000)
  }
}

// 模拟验证店铺域名的函数（实际项目中应该调用API）
const validateShopDomain = async (domain) => {
  // 这里应该调用后端API验证店铺是否存在
  // 返回 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证逻辑
      if (domain && domain.length > 0) {
        resolve(true)
      } else {
        reject(new Error('店铺不存在'))
      }
    }, 1000)
  })
}
</script>

<style lang="scss" scoped>
.authorize-store {
  max-width: 800px;
  margin: 0 auto;

  .breadcrumb {
    margin-bottom: 24px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 32px;

    h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
    }

    .page-description {
      margin: 0;
      font-size: 16px;
      color: #6b7280;
      line-height: 1.6;
    }
  }

  .auth-flow-info {
    margin-bottom: 32px;

    .flow-card {
      .flow-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .flow-steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;

          .step-number {
            width: 32px;
            height: 32px;
            background: #409eff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          .step-content {
            h4 {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
            }

            p {
              margin: 0;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.4;
            }
          }
        }
      }
    }
  }

  .auth-form {
    margin-bottom: 32px;

    .form-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .domain-suffix {
      color: #6b7280;
      font-size: 14px;
    }

    .form-help {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .permissions-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;

      .permission-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #374151;
      }
    }

    .permissions-note {
      margin-top: 16px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }
  }

  .security-section {
    margin-bottom: 32px;

    .security-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .security-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;

      .security-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .security-text {
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .faq-section {
    .faq-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
}

:deep(.el-collapse-item__content) {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}
</style> 