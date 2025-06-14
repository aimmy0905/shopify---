<template>
  <!-- 页面头部 -->
  <div class="suppliers-page">
    <div class="page-header">
      <h2 class="page-title">供应商管理</h2>
      <p class="page-description">管理系统中的供应商信息和合作关系</p>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="action-left">
        <!-- 新增供应商按钮 -->
        <el-button type="success" @click="handleCreate" :icon="Plus">
          新增供应商
        </el-button>
        
        <!-- 批量操作按钮 -->
        <el-dropdown @command="handleBatchCommand" v-if="selectedSuppliers.length > 0">
          <el-button type="success">
            批量操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="batch-delete">批量删除</el-dropdown-item>
              <el-dropdown-item command="batch-audit">批量审核</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="action-right">
        <!-- 导出按钮 -->
        <el-button type="success" @click="handleExport" :icon="Download">导出数据</el-button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline class="filter-form">
        <!-- 搜索框 -->
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="按供应商名称、联系人搜索"
            :prefix-icon="Search"
            style="width: 280px"
            @input="handleSearch"
            clearable
          />
        </el-form-item>

        <!-- 状态筛选 -->
        <el-form-item label="状态：">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            style="width: 150px"
            @change="handleFilter"
            clearable
          >
            <el-option label="审核通过" value="approved" />
            <el-option label="审核不通过" value="rejected" />
            <el-option label="待审核" value="pending" />
          </el-select>
        </el-form-item>

        <!-- 供应商类型筛选 -->
        <el-form-item label="类型：">
          <el-select
            v-model="filterForm.type"
            placeholder="全部类型"
            style="width: 150px"
            @change="handleFilter"
            clearable
          >
            <el-option label="国内供应商" value="domestic" />
            <el-option label="海外供应商" value="overseas" />
            <el-option label="品牌方" value="brand" />
            <el-option label="代理商" value="agent" />
          </el-select>
        </el-form-item>

        <!-- 时间范围选择器 -->
        <el-form-item label="创建时间：">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleFilter"
          />
        </el-form-item>

        <!-- 高级筛选折叠面板 -->
        <el-form-item>
          <el-button type="info" @click="showAdvancedFilter = !showAdvancedFilter" text>
            高级筛选 <el-icon><arrow-down v-if="!showAdvancedFilter" /><arrow-up v-else /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选面板 -->
      <el-collapse-transition>
        <div v-show="showAdvancedFilter" class="advanced-filter">
          <el-form :model="advancedFilter" inline>
            <el-form-item label="联系方式：">
              <el-input v-model="advancedFilter.contact" placeholder="电话/邮箱" style="width: 200px" />
            </el-form-item>
            <el-form-item label="地区：">
              <el-input v-model="advancedFilter.region" placeholder="所在地区" style="width: 200px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAdvancedFilter">筛选</el-button>
              <el-button type="info" @click="resetAdvancedFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 供应商列表表格 -->
    <div class="table-section">
      <el-table
        :data="supplierList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <!-- 复选框列 -->
        <el-table-column type="selection" width="55" />

        <!-- 供应商名称 -->
        <el-table-column prop="name" label="供应商名称" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button type="primary" @click="handleViewDetail(row)" link>
              {{ row.name }}
            </el-button>
          </template>
        </el-table-column>

        <!-- 联系人 -->
        <el-table-column prop="contactPerson" label="联系人" width="120" />

        <!-- 联系方式 -->
        <el-table-column prop="contactInfo" label="联系方式" width="180" show-overflow-tooltip />

        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              effect="light"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 审核不通过原因 -->
        <el-table-column prop="rejectReason" label="审核不通过原因" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 'rejected'" class="reject-reason">
              {{ row.rejectReason || '无' }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 供应商类型 -->
        <el-table-column prop="type" label="供应商类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <!-- 备注信息 -->
        <el-table-column prop="remark" label="备注信息" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '无' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              size="small" 
              type="success" 
              @click="handleAudit(row)"
            >
              审核
            </el-button>
            <el-button size="small" type="info" @click="handleViewProducts(row)">查看商品</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 空状态提示 -->
      <div v-if="!loading && supplierList.length === 0" class="empty-state">
        <el-empty description="暂无供应商数据">
          <el-button type="primary" @click="handleCreate">添加第一个供应商</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 供应商审核弹窗 -->
    <SupplierAuditModal
      v-model:visible="auditModalVisible"
      :supplier="currentSupplier"
      @confirm="handleAuditConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Download, 
  Search, 
  ArrowDown, 
  ArrowUp 
} from '@element-plus/icons-vue'
import SupplierAuditModal from '@/components/admin/SupplierAuditModal.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const showAdvancedFilter = ref(false)
const auditModalVisible = ref(false)
const currentSupplier = ref(null)
const selectedSuppliers = ref([])

// 筛选表单
const filterForm = reactive({
  keyword: '',
  status: '',
  type: '',
  dateRange: null
})

// 高级筛选表单
const advancedFilter = reactive({
  contact: '',
  region: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 供应商列表数据（模拟数据）
const supplierList = ref([
  {
    id: 1,
    name: '阿里巴巴供应链有限公司',
    contactPerson: '张三',
    contactInfo: '13800138000 | zhang@alibaba.com',
    status: 'approved',
    type: 'domestic',
    createdAt: '2024-01-15 10:30:00',
    remark: '主要供应电子产品，合作关系良好'
  },
  {
    id: 2,
    name: '深圳华强电子集团',
    contactPerson: '李四',
    contactInfo: '13900139000 | li@huaqiang.com',
    status: 'pending',
    type: 'domestic',
    createdAt: '2024-01-14 14:20:00',
    remark: '电子配件供应商，待审核'
  },
  {
    id: 3,
    name: 'Global Trading Co.',
    contactPerson: 'John Smith',
    contactInfo: '+1-555-0123 | john@global.com',
    status: 'rejected',
    type: 'overseas',
    createdAt: '2024-01-13 09:15:00',
    remark: '海外供应商',
    rejectReason: '资质文件不完整，需要重新提交'
  }
])

// 计算属性
const filteredSuppliers = computed(() => {
  // 这里应该是实际的筛选逻辑
  return supplierList.value
})

// 方法定义
const handleCreate = () => {
  router.push('/admin/suppliers/create')
}

const handleEdit = (row) => {
  router.push(`/admin/suppliers/${row.id}/edit`)
}

const handleViewDetail = (row) => {
  router.push(`/admin/suppliers/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除供应商"${row.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用删除API
    ElMessage.success('删除成功')
    await loadSuppliers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleAudit = (row) => {
  currentSupplier.value = row
  auditModalVisible.value = true
}

const handleAuditConfirm = async (auditData) => {
  try {
    // 这里应该调用审核API
    ElMessage.success('审核完成')
    auditModalVisible.value = false
    await loadSuppliers()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

const handleViewProducts = (row) => {
  router.push(`/admin/suppliers/${row.id}/products`)
}

const handleSelectionChange = (selection) => {
  selectedSuppliers.value = selection
}

const handleBatchCommand = async (command) => {
  if (selectedSuppliers.value.length === 0) {
    ElMessage.warning('请选择要操作的供应商')
    return
  }

  try {
    if (command === 'batch-delete') {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedSuppliers.value.length} 个供应商吗？`,
        '批量删除确认',
        { type: 'warning' }
      )
      // 调用批量删除API
      ElMessage.success('批量删除成功')
    } else if (command === 'batch-audit') {
      // 批量审核逻辑
      ElMessage.success('批量审核完成')
    }
    
    await loadSuppliers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleExport = () => {
  // 导出逻辑
  ElMessage.success('导出成功')
}

const handleSearch = () => {
  // 搜索逻辑
  loadSuppliers()
}

const handleFilter = () => {
  // 筛选逻辑
  loadSuppliers()
}

const handleAdvancedFilter = () => {
  // 高级筛选逻辑
  loadSuppliers()
}

const resetAdvancedFilter = () => {
  Object.keys(advancedFilter).forEach(key => {
    advancedFilter[key] = ''
  })
  loadSuppliers()
}

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize
  loadSuppliers()
}

const handleCurrentChange = (newPage) => {
  pagination.currentPage = newPage
  loadSuppliers()
}

// 辅助方法
const getStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    approved: '审核通过',
    rejected: '审核不通过',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const getTypeText = (type) => {
  const textMap = {
    domestic: '国内供应商',
    overseas: '海外供应商',
    brand: '品牌方',
    agent: '代理商'
  }
  return textMap[type] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 加载供应商数据
const loadSuppliers = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载数据
    // const response = await supplierApi.getList(filterForm, pagination)
    // supplierList.value = response.data.list
    // pagination.total = response.data.total
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = 100 // 模拟总数
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(() => {
  loadSuppliers()
})
</script> 

<style scoped lang="scss">
.suppliers-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .page-description {
      color: #909399;
      margin: 0;
    }
  }

  .action-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .action-left {
      display: flex;
      gap: 12px;
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .filter-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }

    .advanced-filter {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;
    }
  }

  .table-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .reject-reason {
      color: #f56c6c;
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
  }

  .empty-state {
    padding: 40px;
    text-align: center;
    background: white;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .suppliers-page {
    padding: 10px;

    .action-section {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .filter-form {
      .el-form-item {
        display: block !important;
        margin-right: 0 !important;
      }
    }
  }
}
</style> 