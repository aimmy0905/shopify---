<template>
  <PlaceholderPage
    title="客户余额"
    description="管理客户账户余额和资金流水"
    :action-buttons="[
      { text: '余额调整', type: 'primary', action: adjustBalance },
      { text: '冻结账户', type: 'danger', action: freezeAccount },
      { text: '余额报表', type: 'default', action: balanceReport }
    ]"
  />
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const adjustBalance = () => {
  console.log('余额调整')
}

const freezeAccount = () => {
  console.log('冻结账户')
}

const balanceReport = () => {
  console.log('余额报表')
}
</script> 