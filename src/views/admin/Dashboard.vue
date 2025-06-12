<template>
  <PlaceholderPage
    title="管理后台"
    description="查看系统运营数据和管理概览信息"
    :action-buttons="[
      { text: '数据报表', type: 'primary', action: viewReports },
      { text: '系统监控', type: 'success', action: systemMonitor },
      { text: '用户管理', type: 'default', action: manageUsers }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const viewReports = () => {
  console.log('查看数据报表')
}

const systemMonitor = () => {
  console.log('系统监控')
}

const manageUsers = () => {
  router.push('/admin/users')
}
</script> 