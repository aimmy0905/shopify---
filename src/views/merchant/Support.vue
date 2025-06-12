<template>
  <PlaceholderPage
    title="客服支持"
    description="获取帮助支持，联系客服团队解决问题"
    :action-buttons="[
      { text: '在线客服', type: 'primary', action: openChat },
      { text: '提交工单', type: 'success', action: createTicket },
      { text: '查看帮助文档', type: 'default', action: viewDocs }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const openChat = () => {
  console.log('打开在线客服')
}

const createTicket = () => {
  console.log('提交工单')
}

const viewDocs = () => {
  console.log('查看帮助文档')
}
</script> 