<template>
  <div class="admin-commission">
    <div class="page-header">
      <h1>分佣管理</h1>
      <p>管理平台分佣体系和佣金结算</p>
    </div>
    
    <el-tabs v-model="activeTab" class="commission-tabs">
      <el-tab-pane label="推荐人管理" name="referrers">
        <PlaceholderPage 
          title="推荐人管理"
          :details="[
            '管理所有推荐人信息',
            '推荐关系链查看',
            '推荐人等级设置',
            '推荐奖励规则配置'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">添加推荐人</el-button>
            <el-button>导出推荐数据</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="结算记录" name="settlements">
        <PlaceholderPage 
          title="佣金结算记录"
          :details="[
            '查看所有佣金结算记录',
            '结算状态管理',
            '结算金额统计',
            '结算异常处理'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="success">批量结算</el-button>
            <el-button type="warning">重新计算</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="佣金规则" name="rules">
        <PlaceholderPage 
          title="佣金规则配置"
          :details="[
            '设置佣金比例规则',
            '配置分佣层级结构',
            '管理特殊奖励机制',
            '佣金计算公式设置'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">修改规则</el-button>
            <el-button>预览效果</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const activeTab = ref('referrers')
</script>

<style scoped>
.admin-commission {
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

.commission-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 