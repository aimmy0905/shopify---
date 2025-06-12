<template>
  <PlaceholderPage
    title="Invoice管理"
    description="管理您的发票申请和下载发票文件"
    :action-buttons="[
      { text: '申请Invoice', type: 'primary', action: createInvoice },
      { text: '下载Invoice', type: 'success', action: downloadInvoice },
      { text: '查看历史记录', type: 'default', action: viewHistory }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const createInvoice = () => {
  console.log('申请Invoice')
}

const downloadInvoice = () => {
  console.log('下载Invoice')
}

const viewHistory = () => {
  console.log('查看历史记录')
}
</script> 