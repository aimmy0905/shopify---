<template>
  <div class="support-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的专属客服</h1>
      <p class="page-subtitle">快速获取帮助支持，联系专属客服团队</p>
    </div>

    <!-- 客服信息卡片 -->
    <el-card class="service-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">您的专属客服</span>
          <el-tag type="success" size="small">在线</el-tag>
        </div>
      </template>

      <div class="service-info">
        <!-- 客服头像和基本信息 -->
        <div class="service-avatar-section">
          <el-avatar
            :size="100"
            src="/avatars/customer-service.jpg"
            class="service-avatar"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="service-details">
            <h3 class="service-name">李小雨</h3>
            <p class="service-role">高级客服顾问</p>
            <p class="service-description">专业解决商家运营问题，提供全方位技术支持</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 联系方式卡片 -->
    <el-card class="contact-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">联系方式</span>
          <span class="work-time">工作时间：9:00-18:00 (周一至周五)</span>
        </div>
      </template>

      <div class="contact-methods">
        <div class="contact-grid">
          <!-- 电话联系 -->
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon size="24" color="#409EFF"><Phone /></el-icon>
            </div>
            <div class="contact-info">
              <h4>电话号码</h4>
              <p class="contact-value">400-888-6666</p>
              <el-button
                type="primary"
                size="small"
                @click="makePhoneCall"
                :icon="Phone"
              >
                立即拨打
              </el-button>
            </div>
          </div>

          <!-- 邮箱联系 -->
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon size="24" color="#67C23A"><Message /></el-icon>
            </div>
            <div class="contact-info">
              <h4>电子邮箱</h4>
              <p class="contact-value">support@shopify-system.com</p>
              <el-button
                type="success"
                size="small"
                @click="sendEmail"
                :icon="Message"
              >
                发送邮件
              </el-button>
            </div>
          </div>

          <!-- 微信联系 -->
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon size="24" color="#1AAD19"><ChatDotRound /></el-icon>
            </div>
            <div class="contact-info">
              <h4>微信号</h4>
              <p class="contact-value">ShopifySupport2024</p>
              <div class="wechat-buttons">
                <el-button
                  type="warning"
                  size="small"
                  @click="copyWechat"
                  :icon="CopyDocument"
                >
                  复制微信号
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="showWechatQR"
                  :icon="Picture"
                >
                  查看二维码
                </el-button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </el-card>

    <!-- 常见问题卡片 -->
    <el-card class="faq-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">常见问题</span>
          <span class="faq-subtitle">快速找到答案</span>
        </div>
      </template>

      <div class="faq-content">
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item
            v-for="(faq, index) in faqList"
            :key="index"
            :title="faq.question"
            :name="index"
          >
            <div class="faq-answer">
              <p>{{ faq.answer }}</p>
              <div v-if="faq.links && faq.links.length > 0" class="faq-links">
                <h5>相关链接：</h5>
                <ul>
                  <li v-for="link in faq.links" :key="link.url">
                    <el-link :href="link.url" type="primary" target="_blank">
                      {{ link.title }}
                    </el-link>
                  </li>
                </ul>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 微信二维码弹窗 -->
    <el-dialog
      v-model="showQRDialog"
      title="微信客服二维码"
      width="400px"
      :close-on-click-modal="true"
      center
    >
      <div class="qr-content">
        <div class="qr-image-container">
          <img
            src="/images/wechat-qr-code.png"
            alt="微信客服二维码"
            class="qr-image"
            @error="handleImageError"
          />
        </div>
        <div class="qr-info">
          <p class="qr-title">扫描二维码添加客服微信</p>
          <p class="qr-wechat-id">微信号：ShopifySupport2024</p>
          <p class="qr-tips">扫描上方二维码或搜索微信号添加客服</p>
        </div>
      </div>
      <template #footer>
        <div class="qr-footer">
          <el-button @click="showQRDialog = false">关闭</el-button>
          <el-button type="primary" @click="copyWechat">复制微信号</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Phone,
  Message,
  ChatDotRound,
  CopyDocument,
  Picture
} from '@element-plus/icons-vue'

// 响应式数据
const activeNames = ref([])
const showQRDialog = ref(false)

// 常见问题数据
const faqList = ref([
  {
    question: '如何添加新的Shopify店铺？',
    answer: '您可以在"店铺管理"页面点击"添加店铺"按钮，然后输入您的Shopify店铺域名和API密钥。系统会自动验证并连接您的店铺。',
    links: [
      { title: '店铺管理指南', url: '/docs/store-management' },
      { title: 'API密钥获取教程', url: '/docs/api-keys' }
    ]
  },
  {
    question: '如何批量上传商品？',
    answer: '进入"商品管理"页面，点击"批量上传"按钮，下载我们的商品模板，填写完成后上传即可。系统支持Excel和CSV格式文件。',
    links: [
      { title: '商品上传模板', url: '/templates/product-template.xlsx' },
      { title: '批量上传指南', url: '/docs/bulk-upload' }
    ]
  },
  {
    question: '订单处理失败怎么办？',
    answer: '订单处理失败可能由多种原因导致，如库存不足、支付问题等。请在"订单管理"页面查看具体的错误信息，或联系客服获取帮助。',
    links: [
      { title: '订单处理指南', url: '/docs/order-processing' },
      { title: '常见错误解决方案', url: '/docs/error-solutions' }
    ]
  },
  {
    question: '如何设置商品的利润率？',
    answer: '在"商品管理"页面，选择要设置的商品，点击"编辑"按钮，在价格设置部分可以设置成本价、售价和利润率。系统会自动计算利润。',
    links: [
      { title: '价格策略指南', url: '/docs/pricing-strategy' }
    ]
  },
  {
    question: '佣金是如何计算的？',
    answer: '佣金根据您的等级和推荐的下级用户的订单金额计算。具体佣金比例可以在"佣金管理"页面查看，每月结算一次。',
    links: [
      { title: '佣金制度说明', url: '/docs/commission-system' },
      { title: '等级升级条件', url: '/docs/level-upgrade' }
    ]
  },
  {
    question: '账户余额如何充值和提现？',
    answer: '在"账户余额"页面，您可以通过PayPal、信用卡等方式充值。提现需要绑定银行账户，处理时间为1-3个工作日。',
    links: [
      { title: '充值提现指南', url: '/docs/balance-management' }
    ]
  },
  {
    question: '如何查看物流信息？',
    answer: '在"物流管理"页面，您可以查看所有订单的物流状态，包括发货、运输中、已送达等。系统会自动同步物流信息。',
    links: [
      { title: '物流跟踪指南', url: '/docs/logistics-tracking' }
    ]
  },
  {
    question: '系统维护时间是什么时候？',
    answer: '系统维护通常在每周日凌晨2:00-4:00进行，维护期间可能无法访问部分功能。我们会提前通知用户。',
    links: []
  }
])

// 方法定义
const makePhoneCall = () => {
  window.open('tel:400-888-6666')
  ElMessage.success('正在为您拨打客服电话...')
}

const sendEmail = () => {
  window.open('mailto:support@shopify-system.com?subject=客服咨询&body=请描述您的问题：')
  ElMessage.success('正在打开邮件客户端...')
}

const copyWechat = async () => {
  try {
    await navigator.clipboard.writeText('ShopifySupport2024')
    ElMessage.success('微信号已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制微信号：ShopifySupport2024')
  }
}

const showWechatQR = () => {
  showQRDialog.value = true
}

const handleImageError = () => {
  ElMessage.warning('二维码图片加载失败，请稍后再试')
}


</script>

<style scoped>
.support-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.service-card,
.contact-card,
.faq-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.work-time {
  font-size: 12px;
  color: #909399;
}

.faq-subtitle {
  font-size: 12px;
  color: #909399;
}

/* 客服信息样式 */
.service-info {
  padding: 20px 0;
}

.service-avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.service-avatar {
  flex-shrink: 0;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.service-role {
  font-size: 16px;
  color: #409EFF;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.service-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}

/* 联系方式样式 */
.contact-methods {
  padding: 20px 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.contact-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-info {
  flex: 1;
}

.contact-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.contact-value {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.wechat-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.wechat-buttons .el-button {
  flex: 1;
  min-width: 100px;
}

/* 常见问题样式 */
.faq-content {
  padding: 20px 0;
}

.faq-answer {
  padding: 16px 0;
  line-height: 1.6;
}

.faq-answer p {
  color: #606266;
  margin: 0 0 16px 0;
}

.faq-links h5 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 8px 0;
}

.faq-links ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.faq-links li {
  margin-bottom: 4px;
}

/* 微信二维码弹窗样式 */
.qr-content {
  text-align: center;
  padding: 20px 0;
}

.qr-image-container {
  margin-bottom: 20px;
}

.qr-image {
  width: 200px;
  height: 200px;
  border: 2px solid #EBEEF5;
  border-radius: 8px;
  object-fit: cover;
}

.qr-info {
  margin-top: 16px;
}

.qr-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.qr-wechat-id {
  font-size: 14px;
  color: #409EFF;
  margin: 0 0 8px 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.qr-tips {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.qr-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .support-container {
    padding: 16px;
  }
  
  .service-avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .wechat-buttons {
    flex-direction: column;
  }
  
  .wechat-buttons .el-button {
    width: 100%;
    min-width: auto;
  }
}
</style> 