<template>
  <div class="admin-orders">
    <div class="page-header">
      <h1>订单管理</h1>
      <p>管理所有商家的订单信息</p>
    </div>
    
    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="店铺订单" name="store">
        <PlaceholderPage 
          title="店铺订单管理"
          :details="[
            '查看所有商家的店铺订单',
            '订单状态管理和跟踪',
            '订单数据统计和分析',
            '异常订单处理'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">导出订单数据</el-button>
            <el-button>刷新数据</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="采购订单" name="purchase">
        <PlaceholderPage 
          title="采购订单管理"
          :details="[
            '管理所有采购订单',
            '采购进度跟踪',
            '供应商协调',
            '采购成本分析'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="success">批量处理</el-button>
            <el-button>生成报告</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="发货记录" name="shipping">
        <PlaceholderPage 
          title="发货记录管理"
          :details="[
            '查看所有发货记录',
            '物流信息跟踪',
            '发货统计分析',
            '物流商管理'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="warning">同步物流</el-button>
            <el-button>统计报表</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const activeTab = ref('store')
</script>

<style scoped>
.admin-orders {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  margin: 0;
}

.order-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 