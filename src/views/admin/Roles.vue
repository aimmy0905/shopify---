<template>
  <PlaceholderPage
    title="角色管理"
    description="管理系统中的用户角色和权限分配"
    :action-buttons="[
      { text: '创建角色', type: 'primary', action: createRole },
      { text: '权限分配', type: 'success', action: assignPermissions },
      { text: '返回用户管理', type: 'default', action: goBack }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const createRole = () => {
  console.log('创建角色')
}

const assignPermissions = () => {
  console.log('权限分配')
}

const goBack = () => {
  router.push('/admin/users')
}
</script> 