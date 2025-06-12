<template>
  <div class="add-store">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item>
        <router-link to="/merchant/stores">我的店铺</router-link>
      </el-breadcrumb-item>
      <el-breadcrumb-item>添加店铺</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1>添加 Shopify 店铺</h1>
      <p class="page-description">
        连接您的 Shopify 店铺，开始管理您的商品和订单。我们需要获得店铺的访问权限来帮助您同步数据。
      </p>
    </div>

    <!-- 添加方式选择 -->
    <div class="method-selection">
      <el-card class="method-card">
        <div class="method-header">
          <el-icon size="32" color="#409eff"><Shop /></el-icon>
          <h3>连接方式说明</h3>
        </div>
        <div class="method-description">
          <p>您可以通过以下方式连接 Shopify 店铺：</p>
          <ul>
            <li>输入店铺域名，系统将引导您完成授权</li>
            <li>授权后我们将自动同步您的店铺数据</li>
            <li>您可以随时在店铺详情页面管理授权状态</li>
          </ul>
        </div>
      </el-card>
    </div>

    <!-- 店铺连接表单 -->
    <div class="connect-form">
      <el-card>
        <template #header>
          <div class="form-header">
            <el-icon><Link /></el-icon>
            <span>店铺连接信息</span>
          </div>
        </template>

        <el-form
          ref="storeFormRef"
          :model="storeForm"
          :rules="formRules"
          label-width="120px"
          size="large"
        >
          <el-form-item label="店铺域名" prop="shopDomain">
            <el-input
              v-model="storeForm.shopDomain"
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
              v-model="storeForm.shopName"
              placeholder="为您的店铺设置一个易记的名称"
              :prefix-icon="EditPen"
            />
            <div class="form-help">
              <el-icon><InfoFilled /></el-icon>
              <span>此名称仅用于系统内显示，可以自定义</span>
            </div>
          </el-form-item>

          <el-form-item label="授权范围">
            <div class="permissions-info">
              <div class="permission-item">
                <el-icon color="#67c23a"><Select /></el-icon>
                <span>读取商品信息</span>
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
                <span>管理商品库存</span>
              </div>
            </div>
            <div class="permissions-note">
              <el-alert
                title="安全说明"
                type="info"
                show-icon
                :closable="false"
              >
                <template #default>
                  我们只会访问必要的数据来提供服务，绝不会泄露您的店铺信息。您可以随时撤销授权。
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
                @click="handleConnect"
                :loading="connecting"
              >
                <el-icon v-if="!connecting"><Link /></el-icon>
                {{ connecting ? '正在连接...' : '连接店铺' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
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
          <el-collapse-item title="如何找到我的店铺域名？" name="1">
            <p>
              登录您的 Shopify 管理后台，在浏览器地址栏中可以看到类似
              <code>https://your-store-name.myshopify.com/admin</code> 的地址，
              其中 <code>your-store-name</code> 就是您的店铺域名。
            </p>
          </el-collapse-item>

          <el-collapse-item title="授权是否安全？" name="2">
            <p>
              我们使用 Shopify 官方的 OAuth 授权流程，这是业界标准的安全授权方式。
              我们只会请求必要的权限，并且您可以随时在 Shopify 后台撤销授权。
            </p>
          </el-collapse-item>

          <el-collapse-item title="授权失败怎么办？" name="3">
            <p>
              请检查店铺域名是否正确，确保您的 Shopify 店铺处于正常状态。
              如果问题持续存在，请联系我们的客服团队获取帮助。
            </p>
          </el-collapse-item>

          <el-collapse-item title="可以连接多个店铺吗？" name="4">
            <p>
              是的，您可以连接多个 Shopify 店铺。每个店铺都是独立管理的，
              数据不会相互影响。
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
  Shop,
  Link,
  InfoFilled,
  EditPen,
  Select,
  QuestionFilled
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const connecting = ref(false)
const activeFaq = ref(['1'])
const storeFormRef = ref()

// 表单数据
const storeForm = reactive({
  shopDomain: '',
  shopName: ''
})

// 表单验证规则
const formRules = {
  shopDomain: [
    { required: true, message: '请输入店铺域名', trigger: 'blur' },
    {
      pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      message: '域名格式不正确，只能包含小写字母、数字和连字符',
      trigger: 'blur'
    },
    {
      min: 3,
      max: 63,
      message: '域名长度应在 3-63 个字符之间',
      trigger: 'blur'
    }
  ],
  shopName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    {
      min: 2,
      max: 50,
      message: '店铺名称长度应在 2-50 个字符之间',
      trigger: 'blur'
    }
  ]
}

// 方法
const handleConnect = async () => {
  try {
    // 验证表单
    await storeFormRef.value.validate()
    
    connecting.value = true
    
    // 模拟连接过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 实际项目中这里应该：
    // 1. 调用后端API验证店铺域名
    // 2. 生成Shopify OAuth授权URL
    // 3. 跳转到Shopify授权页面
    
    const fullDomain = `${storeForm.shopDomain}.myshopify.com`
    
    ElNotification({
      title: '连接成功',
      message: `店铺 ${storeForm.shopName} (${fullDomain}) 连接成功！`,
      type: 'success',
      duration: 3000
    })
    
    // 跳转回店铺列表
    router.push('/merchant/stores')
    
  } catch (error) {
    if (error.message) {
      ElMessage.error('请先完善表单信息')
    } else {
      ElMessage.error('连接失败，请稍后重试')
    }
  } finally {
    connecting.value = false
  }
}

const goBack = () => {
  router.push('/merchant/stores')
}
</script>

<style lang="scss" scoped>
.add-store {
  max-width: 800px;
  margin: 0 auto;

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
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

  .method-selection {
    margin-bottom: 24px;

    .method-card {
      .method-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .method-description {
        p {
          margin: 0 0 12px 0;
          color: #4b5563;
        }

        ul {
          margin: 0;
          padding-left: 20px;
          
          li {
            margin-bottom: 8px;
            color: #6b7280;
            line-height: 1.5;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }

  .connect-form {
    margin-bottom: 24px;

    .form-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1f2937;
    }

    .domain-suffix {
      color: #9ca3af;
      font-size: 14px;
    }

    .form-help {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;

      code {
        background: #f3f4f6;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
      }
    }

    .permissions-info {
      .permission-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #4b5563;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .permissions-note {
      margin-top: 12px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }

  .faq-section {
    .faq-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #1f2937;
    }

    :deep(.el-collapse-item__header) {
      font-weight: 500;
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 16px;
      line-height: 1.6;
      color: #4b5563;

      code {
        background: #f3f4f6;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .add-store {
    padding: 0 16px;

    .form-actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style> 