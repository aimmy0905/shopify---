<template>
  <PlaceholderPage
    title="管理员用户"
    description="管理系统管理员账户和权限设置"
    :action-buttons="[
      { text: '添加管理员', type: 'primary', action: addUser },
      { text: '权限设置', type: 'warning', action: setPermissions },
      { text: '角色管理', type: 'default', action: manageRoles }
    ]"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const router = useRouter()

const addUser = () => {
  console.log('添加管理员')
}

const setPermissions = () => {
  console.log('权限设置')
}

const manageRoles = () => {
  router.push('/admin/roles')
}
</script> 