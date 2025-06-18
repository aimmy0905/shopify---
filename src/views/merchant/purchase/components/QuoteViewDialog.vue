<template>
  <el-dialog
    v-model="dialogVisible"
    title="报价单查看"
    width="80%"
    :close-on-click-modal="false"
    class="quote-dialog"
  >
    <div class="quote-content">
      <!-- PDF预览区域 -->
      <div class="pdf-viewer">
        <iframe
          v-if="quoteData?.quoteDocument"
          :src="getPdfUrl(quoteData.quoteDocument)"
          frameborder="0"
          class="pdf-iframe"
        ></iframe>
        <div v-else class="no-pdf">
          <el-empty description="暂无报价单" />
        </div>
      </div>

      <!-- 报价信息 -->
      <div class="quote-info">
        <div class="info-item">
          <span class="label">商品名称：</span>
          <span class="value">{{ quoteData?.productName }}</span>
        </div>
        <div class="info-item">
          <span class="label">目标售价：</span>
          <span class="value">${{ quoteData?.targetPrice }}</span>
        </div>
        <div class="info-item">
          <span class="label">最终报价：</span>
          <span class="value highlight">${{ quoteData?.finalQuote }}</span>
        </div>
        <div class="info-item">
          <span class="label">报价时间：</span>
          <span class="value">{{ formatDate(quoteData?.quoteTime) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button 
          v-if="quoteData?.quoteDocument"
          type="primary" 
          @click="downloadQuote"
        >
          下载报价单
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  quoteData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 获取PDF URL
const getPdfUrl = (document) => {
  // 返回静态HTML文件URL用于演示
  return `/${document}`
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
}

// 下载报价单
const downloadQuote = () => {
  if (!props.quoteData?.quoteDocument) {
    ElMessage.warning('暂无报价单可下载')
    return
  }

  // 模拟下载
  const link = document.createElement('a')
  link.href = getPdfUrl(props.quoteData.quoteDocument)
  link.download = `报价单_${props.quoteData.id}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.quote-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.quote-content {
  display: flex;
  height: 600px;
}

.pdf-viewer {
  flex: 1;
  border-right: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.no-pdf {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-info {
  width: 300px;
  padding: 20px;
  background: #fff;
}

.info-item {
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  color: #909399;
  margin-bottom: 4px;
}

.value {
  color: #303133;
  font-size: 16px;
}

.value.highlight {
  color: #67c23a;
  font-weight: 500;
  font-size: 20px;
}

.dialog-footer {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #e4e7ed;
}
</style> 