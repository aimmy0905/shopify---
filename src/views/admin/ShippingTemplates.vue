<template>
  <div class="shipping-templates-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">运费模板管理</h1>
    </div>

    <!-- 操作区域 -->
    <el-card class="action-card">
      <div class="action-bar">
        <div class="action-left">
          <el-button type="primary" @click="createTemplate">
            <el-icon><Plus /></el-icon>
            新增运费模板
          </el-button>
        </div>
        <div class="action-right">
          <el-input
            v-model="searchForm.keyword"
            placeholder="支持按模板名称、物流公司搜索"
            clearable
            style="width: 300px"
            @keyup.enter="searchTemplates"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="searchTemplates">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 运费模板列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">运费模板列表</span>
          <div class="batch-actions">
            <el-button
              type="danger"
              @click="batchDelete"
              :disabled="!selectedTemplates.length"
            >
              批量删除 ({{ selectedTemplates.length }})
            </el-button>
            <el-button
              type="success"
              @click="batchEnable"
              :disabled="!selectedTemplates.length"
            >
              批量启用
            </el-button>
            <el-button
              type="warning"
              @click="batchDisable"
              :disabled="!selectedTemplates.length"
            >
              批量停用
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="templatesList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="模板名称" min-width="150">
          <template #default="scope">
            <span class="template-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="物流公司" width="120">
          <template #default="scope">
            {{ scope.row.shippingCompany }}
          </template>
        </el-table-column>

        <el-table-column label="配送国家/地区" min-width="200">
          <template #default="scope">
            <div class="countries-tags">
              <el-tag
                v-for="country in scope.row.countries.slice(0, 3)"
                :key="country"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ country }}
              </el-tag>
              <el-tag
                v-if="scope.row.countries.length > 3"
                size="small"
                type="info"
              >
                +{{ scope.row.countries.length - 3 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="基础运费" width="100" align="right">
          <template #default="scope">
            <span class="price-text">${{ scope.row.basePrice.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="计费方式" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.chargeType === 'weight' ? 'primary' : 'success'" size="small">
              {{ scope.row.chargeType === 'weight' ? '重量' : '体积' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="续费单价" width="100" align="right">
          <template #default="scope">
            <span class="price-text">${{ scope.row.additionalPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'enabled' ? '启用中' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button
              size="small"
              :type="scope.row.status === 'enabled' ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteTemplate(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalTemplates"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTemplates"
          @current-change="loadTemplates"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const tableLoading = ref(false)
const selectedTemplates = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalTemplates = ref(0)
const templatesList = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 方法
const loadTemplates = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟运费模板数据
    templatesList.value = [
      {
        id: 1,
        name: '美国标准运费模板',
        shippingCompany: 'FedEx',
        countries: ['美国', '加拿大', '墨西哥'],
        basePrice: 15.99,
        chargeType: 'weight',
        additionalPrice: 2.50,
        status: 'enabled',
        createTime: '2023-11-01 10:30:00'
      },
      {
        id: 2,
        name: '欧洲快递模板',
        shippingCompany: 'DHL',
        countries: ['德国', '法国', '英国', '意大利', '西班牙', '荷兰'],
        basePrice: 22.50,
        chargeType: 'volume',
        additionalPrice: 3.80,
        status: 'enabled',
        createTime: '2023-11-02 14:20:00'
      },
      {
        id: 3,
        name: '亚太地区运费模板',
        shippingCompany: 'UPS',
        countries: ['日本', '韩国', '新加坡', '澳大利亚'],
        basePrice: 18.75,
        chargeType: 'weight',
        additionalPrice: 2.90,
        status: 'disabled',
        createTime: '2023-11-03 09:15:00'
      },
      {
        id: 4,
        name: '全球经济运费模板',
        shippingCompany: '中国邮政',
        countries: ['中国', '印度', '巴西', '俄罗斯', '南非'],
        basePrice: 8.99,
        chargeType: 'weight',
        additionalPrice: 1.20,
        status: 'enabled',
        createTime: '2023-11-04 16:45:00'
      }
    ]

    totalTemplates.value = 24
  } catch (error) {
    console.error('加载运费模板失败:', error)
    ElMessage.error('加载运费模板失败')
  } finally {
    tableLoading.value = false
  }
}

const searchTemplates = () => {
  currentPage.value = 1
  loadTemplates()
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchTemplates()
}

const createTemplate = () => {
  router.push('/admin/shipping-templates/create')
}

const editTemplate = (template) => {
  router.push(`/admin/shipping-templates/edit/${template.id}`)
}

const viewDetail = (template) => {
  router.push(`/admin/shipping-templates/${template.id}`)
}

const handleSelectionChange = (selection) => {
  selectedTemplates.value = selection
}

const toggleStatus = async (template) => {
  const action = template.status === 'enabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}运费模板 "${template.name}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    template.status = template.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  } catch {
    // 用户取消
  }
}

const deleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除运费模板 "${template.name}" 吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    loadTemplates()
  } catch {
    // 用户取消
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTemplates.value.length} 个运费模板吗？删除后不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量删除成功')
    selectedTemplates.value = []
    loadTemplates()
  } catch {
    // 用户取消
  }
}

const batchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${selectedTemplates.value.length} 个运费模板吗？`,
      '批量启用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量启用成功')
    selectedTemplates.value = []
    loadTemplates()
  } catch {
    // 用户取消
  }
}

const batchDisable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要停用选中的 ${selectedTemplates.value.length} 个运费模板吗？`,
      '批量停用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('批量停用成功')
    selectedTemplates.value = []
    loadTemplates()
  } catch {
    // 用户取消
  }
}

// 生命周期
onMounted(() => {
  loadTemplates()
})
</script>

<style scoped>
.shipping-templates-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 操作卡片 */
.action-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 表格卡片 */
.table-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-weight: 600;
  color: #303133;
  font-size: 18px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* 模板名称 */
.template-name {
  font-weight: 500;
  color: #303133;
}

/* 国家标签 */
.countries-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 价格文本 */
.price-text {
  font-weight: 600;
  color: #409eff;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shipping-templates-page {
    padding: 12px;
  }

  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-right {
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .batch-actions {
    justify-content: center;
  }
}
</style>