<template>
  <div class="admin-purchase">
    <PlaceholderPage 
      title="采购申请管理"
      :details="[
        '审核商家的采购申请',
        '管理采购申请状态',
        '协调供应商资源',
        '采购数据统计分析',
        '采购成本优化'
      ]"
      show-actions
    >
      <template #actions>
        <el-button type="primary">批量审核</el-button>
        <el-button type="success">导出报告</el-button>
        <el-button>刷新数据</el-button>
      </template>
    </PlaceholderPage>
  </div>
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
</script>

<style scoped>
.admin-purchase {
  padding: 20px;
}
</style> 