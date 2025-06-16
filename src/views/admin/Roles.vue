<template>
  <div class="admin-roles-page">
    <div class="page-header">
      <h1>角色管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="addRole">
          <el-icon><Plus /></el-icon> 添加角色
        </el-button>
      </div>
    </div>

    <!-- 批量操作区域 -->
    <batch-actions v-if="selectedRoles.length" :selected-count="selectedRoles.length">
      <el-button type="danger" @click="batchDeleteRoles">批量删除</el-button>
    </batch-actions>

    <!-- 搜索过滤区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="角色名称">
          <el-input v-model="filters.name" placeholder="请输入角色名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 角色表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="rolesList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="isRoleSelectable"></el-table-column>
        <el-table-column prop="id" label="角色ID" width="80"></el-table-column>
        <el-table-column prop="name" label="角色名称" width="120"></el-table-column>
        <el-table-column prop="description" label="角色描述"></el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editRole(scope.row)">编辑</el-button>
            <el-button size="small" type="success" @click="assignPermissions(scope.row)">权限设置</el-button>
            <el-button size="small" type="info" @click="viewUsers(scope.row)">查看用户</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteRole(scope.row)" 
              :disabled="scope.row.isSystem"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 角色用户列表弹窗 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="`角色用户列表 - ${currentRole?.name || ''}`"
      width="60%"
      append-to-body
    >
      <el-table
        v-loading="userDialogLoading"
        :data="roleUsersList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="viewUserDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 角色用户列表分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleUserSizeChange"
          @current-change="handleUserCurrentChange"
          :current-page="userPagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="userPagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="userPagination.total"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 权限设置弹窗 -->
    <permission-dialog
      v-model:visible="permissionDialogVisible"
      :title="`权限设置 - ${currentRole?.name || ''}`"
      :loading="permissionDialogLoading"
      :initial-permissions="selectedPermissions"
      @confirm="confirmPermissions"
      @cancel="cancelPermissions"
    />

    <!-- 确认对话框 -->
    <confirm-dialog
      v-model:visible="confirmDialogVisible"
      :title="confirmDialogConfig.title"
      :message="confirmDialogConfig.message"
      :type="confirmDialogConfig.type"
      :loading="confirmDialogConfig.loading"
      @confirm="confirmDialogConfig.onConfirm"
      @cancel="confirmDialogConfig.onCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import BatchActions from '@/components/admin/BatchActions.vue'
import PermissionDialog from '@/components/admin/PermissionDialog.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'

const router = useRouter()

// 搜索过滤条件
const filters = reactive({
  name: ''
})

// 表格数据
const rolesList = ref([])
const loading = ref(false)
const selectedRoles = ref([])

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 角色用户列表弹窗
const userDialogVisible = ref(false)
const userDialogLoading = ref(false)
const currentRole = ref(null)
const roleUsersList = ref([])

// 用户分页参数
const userPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 权限设置弹窗
const permissionDialogVisible = ref(false)
const permissionDialogLoading = ref(false)
const selectedPermissions = ref([])

// 确认对话框配置
const confirmDialogVisible = ref(false)
const confirmDialogConfig = reactive({
  title: '',
  message: '',
  type: 'warning',
  loading: false,
  onConfirm: () => {},
  onCancel: () => {}
})

// 初始加载数据
onMounted(() => {
  loadRolesList()
})

// 加载角色列表
const loadRolesList = async () => {
  loading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getRoles(filters, pagination.currentPage, pagination.pageSize)
    // rolesList.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    setTimeout(() => {
      const mockData = generateMockData()
      rolesList.value = mockData.data
      pagination.total = mockData.total
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败，请重试')
    loading.value = false
  }
}

// 生成模拟数据
const generateMockData = () => {
  const data = [
    {
      id: 1,
      name: '超级管理员',
      description: '系统最高权限，可以管理所有功能',
      userCount: 2,
      createTime: '2023-01-01 00:00:00',
      isSystem: true
    },
    {
      id: 2,
      name: '财务管理员',
      description: '负责财务相关功能的管理',
      userCount: 5,
      createTime: '2023-01-02 00:00:00',
      isSystem: true
    },
    {
      id: 3,
      name: '客服专员',
      description: '负责客服工单和用户反馈的处理',
      userCount: 8,
      createTime: '2023-01-03 00:00:00',
      isSystem: true
    },
    {
      id: 4,
      name: '商品管理员',
      description: '负责商品上架、审核和分类管理',
      userCount: 4,
      createTime: '2023-01-04 00:00:00',
      isSystem: true
    },
    {
      id: 5,
      name: '订单管理员',
      description: '负责订单处理和物流跟踪',
      userCount: 3,
      createTime: '2023-01-05 00:00:00',
      isSystem: true
    }
  ]
  
  // 添加一些自定义角色
  for (let i = 6; i <= 15; i++) {
    data.push({
      id: i,
      name: `自定义角色${i - 5}`,
      description: `这是一个自定义角色，ID为${i}`,
      userCount: Math.floor(Math.random() * 10),
      createTime: new Date(Date.now() - (i - 5) * 86400000).toLocaleString(),
      isSystem: false
    })
  }
  
  // 应用过滤条件
  let filteredData = [...data]
  
  if (filters.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(filters.name.toLowerCase())
    )
  }
  
  // 分页处理
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = Math.min(start + pagination.pageSize, filteredData.length)
  
  return {
    data: filteredData.slice(start, end),
    total: filteredData.length
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadRolesList()
}

// 重置过滤条件
const resetFilters = () => {
  filters.name = ''
  handleSearch()
}

// 分页尺寸变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadRolesList()
}

// 页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadRolesList()
}

// 添加角色
const addRole = () => {
  router.push('/admin/roles/create')
}

// 编辑角色
const editRole = (role) => {
  router.push(`/admin/roles/edit/${role.id}`)
}

// 判断角色是否可选择（系统预设角色不可批量操作）
const isRoleSelectable = (row) => {
  return !row.isSystem
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRoles.value = selection
}

// 批量删除角色
const batchDeleteRoles = () => {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请至少选择一个角色')
    return
  }
  
  confirmDialogConfig.title = '批量删除确认'
  confirmDialogConfig.message = `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？此操作不可恢复！`
  confirmDialogConfig.type = 'danger'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.batchDeleteRoles(selectedRoles.value.map(role => role.id))
      
      // 模拟操作成功
      setTimeout(() => {
        // 从列表中移除已删除的角色
        const deletedIds = selectedRoles.value.map(role => role.id)
        rolesList.value = rolesList.value.filter(role => !deletedIds.includes(role.id))
        
        // 更新分页总数
        pagination.total -= selectedRoles.value.length
        
        // 清空选中项
        selectedRoles.value = []
        
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success('批量删除成功！')
      }, 500)
    } catch (error) {
      console.error('批量删除角色失败:', error)
      ElMessage.error('批量删除失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 删除角色
const deleteRole = (role) => {
  if (role.isSystem) {
    ElMessage.warning('系统预设角色不可删除')
    return
  }
  
  confirmDialogConfig.title = '删除确认'
  confirmDialogConfig.message = `确定要删除角色 ${role.name} 吗？此操作不可恢复！`
  confirmDialogConfig.type = 'danger'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.deleteRole(role.id)
      
      // 模拟操作成功
      setTimeout(() => {
        // 从列表中移除已删除的角色
        rolesList.value = rolesList.value.filter(item => item.id !== role.id)
        
        // 更新分页总数
        pagination.total -= 1
        
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success('删除成功！')
      }, 500)
    } catch (error) {
      console.error('删除角色失败:', error)
      ElMessage.error('删除失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 查看角色用户
const viewUsers = async (role) => {
  if (role.userCount === 0) {
    ElMessage.info('该角色下暂无用户')
    return
  }
  
  currentRole.value = role
  userDialogVisible.value = true
  userDialogLoading.value = true
  
  // 重置用户分页
  userPagination.currentPage = 1
  userPagination.pageSize = 10
  
  try {
    // 模拟获取角色用户列表
    // const response = await api.getRoleUsers(role.id, userPagination.currentPage, userPagination.pageSize)
    // roleUsersList.value = response.data
    // userPagination.total = response.total
    
    // 模拟数据
    setTimeout(() => {
      const users = []
      for (let i = 1; i <= role.userCount; i++) {
        users.push({
          id: i * 100 + role.id,
          username: `user${i}_role${role.id}`,
          realName: `用户${i}(角色${role.id})`,
          email: `user${i}_role${role.id}@example.com`,
          phone: `1358888${(i * 100 + role.id).toString().padStart(4, '0')}`,
          status: i % 3 === 0 ? 'disabled' : 'active',
          lastLoginTime: new Date(Date.now() - i * 3600000).toLocaleString()
        })
      }
      
      // 分页
      const start = (userPagination.currentPage - 1) * userPagination.pageSize
      const end = start + userPagination.pageSize
      
      roleUsersList.value = users.slice(start, end)
      userPagination.total = users.length
      userDialogLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取角色用户列表失败:', error)
    ElMessage.error('获取角色用户列表失败，请重试')
    userDialogLoading.value = false
  }
}

// 角色用户分页处理
const handleUserSizeChange = (val) => {
  userPagination.pageSize = val
  viewUsers(currentRole.value)
}

const handleUserCurrentChange = (val) => {
  userPagination.currentPage = val
  viewUsers(currentRole.value)
}

// 查看用户详情
const viewUserDetail = (user) => {
  router.push(`/admin/users/${user.id}`)
  userDialogVisible.value = false
}

// 权限设置
const assignPermissions = (role) => {
  currentRole.value = role
  permissionDialogLoading.value = true
  
  // 模拟获取角色权限
  setTimeout(() => {
    // 根据角色ID获取不同的权限
    if (role.id === 1) { // 超级管理员
      selectedPermissions.value = [101, 102, 103, 104, 105, 106, 107, 108, 109, 201, 202, 203, 204, 205, 301, 302, 303, 304, 305, 306, 401, 402, 403, 404, 405, 406, 501, 502, 503, 504, 505, 506, 507, 508]
    } else if (role.id === 2) { // 财务管理员
      selectedPermissions.value = [101, 105, 501, 502, 503, 504, 505, 506, 507, 508]
    } else if (role.id === 3) { // 客服专员
      selectedPermissions.value = [201, 202, 301, 401, 402, 403]
    } else if (role.id === 4) { // 商品管理员
      selectedPermissions.value = [301, 302, 303, 304, 305, 306]
    } else if (role.id === 5) { // 订单管理员
      selectedPermissions.value = [401, 402, 403, 404, 405, 406]
    } else {
      // 自定义角色随机分配一些权限
      const allPermissions = [101, 102, 103, 104, 105, 106, 107, 108, 109, 201, 202, 203, 204, 205, 301, 302, 303, 304, 305, 306, 401, 402, 403, 404, 405, 406, 501, 502, 503, 504, 505, 506, 507, 508]
      selectedPermissions.value = allPermissions.filter(() => Math.random() > 0.5)
    }
    
    permissionDialogLoading.value = false
    permissionDialogVisible.value = true
  }, 500)
}

// 确认权限设置
const confirmPermissions = async (permissions) => {
  permissionDialogLoading.value = true
  
  try {
    // 模拟API调用
    // await api.updateRolePermissions(currentRole.value.id, permissions)
    
    // 模拟操作成功
    setTimeout(() => {
      permissionDialogVisible.value = false
      permissionDialogLoading.value = false
      ElMessage.success('权限设置成功！')
    }, 500)
  } catch (error) {
    console.error('权限设置失败:', error)
    ElMessage.error('权限设置失败，请重试')
    permissionDialogLoading.value = false
  }
}

// 取消权限设置
const cancelPermissions = () => {
  permissionDialogVisible.value = false
}
</script>

<style scoped>
.admin-roles-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style> 