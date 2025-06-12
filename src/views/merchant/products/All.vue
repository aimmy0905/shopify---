<template>
  <div class="products-all">
    <div class="page-header">
      <h1>平台商品</h1>
      <div class="header-actions">
        <el-input placeholder="搜索商品..." clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <div class="content-placeholder">
      <el-empty description="页面开发中，敬请期待！" />
      <p>这是平台商品页面的占位符</p>
      <p>将显示所有可以铺货的商品列表</p>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.products-all {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      .el-input {
        width: 300px;
      }
    }
  }

  .content-placeholder {
    background: white;
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

    p {
      margin: 8px 0;
      color: #6b7280;
    }
  }
}
</style> 