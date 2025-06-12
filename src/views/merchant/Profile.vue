<template>
  <PlaceholderPage
    title="个人设置"
    description="管理您的个人信息、密码和账户设置"
    :action-buttons="[
      { text: '修改个人信息', type: 'primary', action: editProfile },
      { text: '修改密码', type: 'warning', action: changePassword },
      { text: '账户安全设置', type: 'default', action: securitySettings }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const editProfile = () => {
  console.log('修改个人信息')
}

const changePassword = () => {
  console.log('修改密码')
}

const securitySettings = () => {
  console.log('账户安全设置')
}
</script> 