<template>
  <div class="admin-invoices">
    <PlaceholderPage 
      title="Invoice申请管理"
      :details="[
        '审核商家Invoice申请',
        '管理Invoice开具流程',
        'Invoice模板管理',
        'Invoice数据统计',
        '税务合规性检查'
      ]"
      show-actions
    >
      <template #actions>
        <el-button type="primary">批量审核</el-button>
        <el-button type="success">生成报告</el-button>
        <el-button>导出数据</el-button>
      </template>
    </PlaceholderPage>
  </div>
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
</script>

<style scoped>
.admin-invoices {
  padding: 20px;
}
</style> 