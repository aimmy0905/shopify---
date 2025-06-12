<template>
  <div class="admin-settings">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>管理系统配置和参数</p>
    </div>
    
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="语言设置" name="language">
        <PlaceholderPage 
          title="多语言配置"
          :details="[
            '配置系统支持的语言',
            '管理翻译文本内容',
            '设置默认语言选项',
            '语言包导入导出'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">添加语言</el-button>
            <el-button>导入语言包</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="系统参数" name="system">
        <PlaceholderPage 
          title="系统参数配置"
          :details="[
            '系统基础参数设置',
            '业务规则参数配置',
            '性能优化参数调整',
            '安全策略参数管理'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">保存配置</el-button>
            <el-button type="warning">重置默认</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
      
      <el-tab-pane label="通知设置" name="notification">
        <PlaceholderPage 
          title="通知配置管理"
          :details="[
            '邮件通知模板配置',
            '短信通知规则设置',
            '系统消息推送配置',
            '通知频率控制管理'
          ]"
          show-actions
        >
          <template #actions>
            <el-button type="primary">测试通知</el-button>
            <el-button>保存设置</el-button>
          </template>
        </PlaceholderPage>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PlaceholderPage from '@/components/common/PlaceholderPage.vue'

const activeTab = ref('language')
</script>

<style scoped>
.admin-settings {
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

.settings-tabs {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style> 