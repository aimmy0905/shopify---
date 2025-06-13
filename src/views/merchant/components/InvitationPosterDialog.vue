<template>
  <el-dialog
    v-model="dialogVisible"
    title="邀请好友"
    width="500px"
    :before-close="handleClose"
  >
    <div class="invitation-poster">
      <!-- 海报预览区域 -->
      <div class="poster-preview">
        <div class="poster-card">
          <div class="poster-header">
            <div class="logo">
              <el-icon><Shop /></el-icon>
            </div>
            <h3>Shopify铺货系统</h3>
            <p class="subtitle">邀请您一起创业赚钱</p>
          </div>
          
          <div class="poster-content">
            <div class="invitation-info">
              <div class="info-item">
                <label>邀请码</label>
                <div class="code-display">{{ invitationCode }}</div>
              </div>
              
              <div class="info-item">
                <label>邀请链接</label>
                <div class="link-display">{{ shortLink }}</div>
              </div>
            </div>
            
            <div class="commission-rules">
              <h4>分佣规则</h4>
              <div class="rules-list">
                <div class="rule-item">
                  <span class="rule-label">一级分佣</span>
                  <span class="rule-value">{{ commissionRules.level1 }}%</span>
                </div>
                <div class="rule-item">
                  <span class="rule-label">二级分佣</span>
                  <span class="rule-value">{{ commissionRules.level2 }}%</span>
                </div>
                <div class="rule-item">
                  <span class="rule-label">结算周期</span>
                  <span class="rule-value">{{ commissionRules.settlementCycle }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="poster-footer">
            <p class="qr-placeholder">扫码注册 立即开始</p>
            <div class="qr-code">
              <el-icon><Grid /></el-icon>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作区域 -->
      <div class="poster-actions">
        <div class="action-group">
          <div class="action-item">
            <label>邀请码</label>
            <div class="copy-area">
              <el-input :value="invitationCode" readonly />
              <el-button @click="copyCode">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
          </div>
          
          <div class="action-item">
            <label>邀请链接</label>
            <div class="copy-area">
              <el-input :value="invitationLink" readonly />
              <el-button @click="copyLink">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="share-buttons">
          <el-button type="primary" @click="downloadPoster">
            <el-icon><Download /></el-icon>
            下载海报
          </el-button>
          
          <el-button @click="shareToSocial">
            <el-icon><Share /></el-icon>
            分享到社交媒体
          </el-button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Shop, 
  Grid, 
  DocumentCopy, 
  Download, 
  Share 
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  invitationCode: {
    type: String,
    default: ''
  },
  invitationLink: {
    type: String,
    default: ''
  },
  commissionRules: {
    type: Object,
    default: () => ({
      level1: 8,
      level2: 3,
      settlementCycle: '每月结算'
    })
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const dialogVisible = ref(false)

// 计算属性
const shortLink = computed(() => {
  if (!props.invitationLink) return ''
  // 简化显示链接
  const url = new URL(props.invitationLink)
  return `${url.hostname}/reg?ref=${props.invitationCode}`
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const copyCode = () => {
  navigator.clipboard.writeText(props.invitationCode)
  ElMessage.success('邀请码已复制到剪贴板')
}

const copyLink = () => {
  navigator.clipboard.writeText(props.invitationLink)
  ElMessage.success('邀请链接已复制到剪贴板')
}

const downloadPoster = () => {
  // 这里可以使用html2canvas等库来生成海报图片
  ElMessage.info('海报下载功能开发中...')
}

const shareToSocial = () => {
  const shareText = `邀请您加入Shopify铺货系统，使用邀请码：${props.invitationCode}`
  
  // 检查是否支持Web Share API
  if (navigator.share) {
    navigator.share({
      title: 'Shopify铺货系统邀请',
      text: shareText,
      url: props.invitationLink
    }).then(() => {
      ElMessage.success('分享成功')
    }).catch(() => {
      // 降级处理
      fallbackShare(shareText)
    })
  } else {
    fallbackShare(shareText)
  }
}

const fallbackShare = (shareText) => {
  // 复制到剪贴板作为降级处理
  navigator.clipboard.writeText(`${shareText}\n${props.invitationLink}`)
  ElMessage.success('邀请信息已复制到剪贴板，请粘贴到社交媒体分享')
}

// 监听器
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})
</script>

<style scoped>
.invitation-poster {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 海报预览 */
.poster-preview {
  display: flex;
  justify-content: center;
}

.poster-card {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.poster-header {
  margin-bottom: 20px;
}

.poster-header .logo {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 24px;
}

.poster-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.poster-header .subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 海报内容 */
.poster-content {
  margin-bottom: 20px;
}

.invitation-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.code-display,
.link-display {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

.commission-rules h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.rules-list {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-label {
  opacity: 0.9;
}

.rule-value {
  font-weight: 600;
}

/* 海报底部 */
.poster-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
}

.qr-placeholder {
  margin: 0 0 8px 0;
  font-size: 12px;
  opacity: 0.8;
}

.qr-code {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 24px;
}

/* 操作区域 */
.poster-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.copy-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.copy-area .el-input {
  flex: 1;
}

.share-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .invitation-poster {
    gap: 16px;
  }
  
  .poster-card {
    width: 240px;
    padding: 16px;
  }
  
  .poster-header .logo {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .poster-header h3 {
    font-size: 16px;
  }
  
  .copy-area {
    flex-direction: column;
    align-items: stretch;
  }
  
  .share-buttons {
    flex-direction: column;
  }
}
</style> 