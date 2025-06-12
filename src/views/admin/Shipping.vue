<template>
  <div class="admin-shipping">
    <PlaceholderPage 
      title="运费模板管理"
      :details="[
        '创建和管理运费模板',
        '设置不同地区运费规则',
        '配置重量和体积计费',
        '管理物流商合作',
        '运费优化建议'
      ]"
      show-actions
    >
      <template #actions>
        <el-button type="primary">新建模板</el-button>
        <el-button type="success">批量导入</el-button>
        <el-button>同步物流商</el-button>
      </template>
    </PlaceholderPage>
  </div>
</template>

<script setup>
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'
</script>

<style scoped>
.admin-shipping {
  padding: 20px;
}
</style> 