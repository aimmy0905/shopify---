<template>
  <div class="admin-users-page">
    <div class="page-header">
      <h1>管理员用户管理</h1>
      <div class="page-actions">
        <el-button type="primary" @click="addUser">
          <el-icon><Plus /></el-icon> 添加管理员
        </el-button>
      </div>
    </div>

    <!-- 批量操作区域 -->
    <batch-actions v-if="selectedUsers.length" :selected-count="selectedUsers.length">
      <el-button type="warning" @click="batchDisable">批量禁用</el-button>
      <el-button type="success" @click="batchEnable">批量启用</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </batch-actions>

    <!-- 搜索过滤区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="filters.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="filters.realName" placeholder="请输入姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="请输入手机号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="正常" value="active"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.roleId" placeholder="请选择角色" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card class="table-container">
      <el-table
        v-loading="loading"
        :data="usersList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" width="120"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role.id" class="role-tag">
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewUser(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editUser(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-dropdown trigger="click" @command="handleCommand($event, scope.row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import BatchActions from '@/components/admin/BatchActions.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'

const router = useRouter()

// 搜索过滤条件
const filters = reactive({
  username: '',
  realName: '',
  phone: '',
  status: '',
  roleId: ''
})

// 角色选项
const roleOptions = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '财务管理员' },
  { id: 3, name: '客服专员' },
  { id: 4, name: '商品管理员' },
  { id: 5, name: '订单管理员' }
])

// 表格数据
const usersList = ref([])
const loading = ref(false)
const selectedUsers = ref([])

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

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
  loadUsersList()
})

// 加载用户列表
const loadUsersList = async () => {
  loading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getAdminUsers(filters, pagination.currentPage, pagination.pageSize)
    // usersList.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    setTimeout(() => {
      const mockData = generateMockData()
      usersList.value = mockData.data
      pagination.total = mockData.total
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败，请重试')
    loading.value = false
  }
}

// 生成模拟数据
const generateMockData = () => {
  const data = []
  const total = 100
  
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize
  const endIndex = Math.min(startIndex + pagination.pageSize, total)
  
  for (let i = startIndex; i < endIndex; i++) {
    const roles = []
    const roleCount = Math.floor(Math.random() * 2) + 1 // 1-2个角色
    
    for (let j = 0; j < roleCount; j++) {
      const roleIndex = Math.floor(Math.random() * roleOptions.value.length)
      const role = roleOptions.value[roleIndex]
      
      // 避免重复角色
      if (!roles.some(r => r.id === role.id)) {
        roles.push({ id: role.id, name: role.name })
      }
    }
    
    data.push({
      id: i + 1,
      username: `admin${i + 1}`,
      password: '******',
      realName: `管理员${i + 1}`,
      email: `admin${i + 1}@example.com`,
      phone: `1358888${(i + 1).toString().padStart(4, '0')}`,
      roles: roles,
      status: i % 5 === 0 ? 'disabled' : 'active',
      lastLoginTime: new Date(Date.now() - i * 3600000).toLocaleString(),
      createTime: new Date(Date.now() - i * 86400000).toLocaleString()
    })
  }
  
  // 应用过滤条件
  let filteredData = [...data]
  
  if (filters.username) {
    filteredData = filteredData.filter(item => 
      item.username.toLowerCase().includes(filters.username.toLowerCase())
    )
  }
  
  if (filters.realName) {
    filteredData = filteredData.filter(item => 
      item.realName.includes(filters.realName)
    )
  }
  
  if (filters.phone) {
    filteredData = filteredData.filter(item => 
      item.phone.includes(filters.phone)
    )
  }
  
  if (filters.status) {
    filteredData = filteredData.filter(item => 
      item.status === filters.status
    )
  }
  
  if (filters.roleId) {
    filteredData = filteredData.filter(item => 
      item.roles.some(role => role.id === filters.roleId)
    )
  }
  
  return {
    data: filteredData,
    total: filteredData.length
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadUsersList()
}

// 重置过滤条件
const resetFilters = () => {
  filters.username = ''
  filters.realName = ''
  filters.phone = ''
  filters.status = ''
  filters.roleId = ''
  handleSearch()
}

// 分页尺寸变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadUsersList()
}

// 页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  loadUsersList()
}

// 添加管理员
const addUser = () => {
  router.push('/admin/users/create')
}

// 查看用户
const viewUser = (user) => {
  router.push(`/admin/users/${user.id}`)
}

// 编辑用户
const editUser = (user) => {
  router.push(`/admin/users/edit/${user.id}`)
}

// 切换用户状态
const toggleUserStatus = (user) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  
  confirmDialogConfig.title = `${action}确认`
  confirmDialogConfig.message = `确定要${action}用户 ${user.username} 吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.updateUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active')
      
      // 模拟操作成功
      setTimeout(() => {
        user.status = user.status === 'active' ? 'disabled' : 'active'
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success(`${action}成功！`)
      }, 500)
    } catch (error) {
      console.error(`${action}用户失败:`, error)
      ElMessage.error(`${action}失败，请重试`)
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 批量禁用
const batchDisable = () => {
  const activeUsers = selectedUsers.value.filter(user => user.status === 'active')
  
  if (activeUsers.length === 0) {
    ElMessage.warning('没有可禁用的用户')
    return
  }
  
  confirmDialogConfig.title = '批量禁用确认'
  confirmDialogConfig.message = `确定要禁用选中的 ${activeUsers.length} 个用户吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.batchUpdateUserStatus(activeUsers.map(user => user.id), 'disabled')
      
      // 模拟操作成功
      setTimeout(() => {
        activeUsers.forEach(user => {
          user.status = 'disabled'
        })
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success(`批量禁用成功！`)
      }, 500)
    } catch (error) {
      console.error('批量禁用用户失败:', error)
      ElMessage.error('批量禁用失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 批量启用
const batchEnable = () => {
  const disabledUsers = selectedUsers.value.filter(user => user.status === 'disabled')
  
  if (disabledUsers.length === 0) {
    ElMessage.warning('没有可启用的用户')
    return
  }
  
  confirmDialogConfig.title = '批量启用确认'
  confirmDialogConfig.message = `确定要启用选中的 ${disabledUsers.length} 个用户吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.batchUpdateUserStatus(disabledUsers.map(user => user.id), 'active')
      
      // 模拟操作成功
      setTimeout(() => {
        disabledUsers.forEach(user => {
          user.status = 'active'
        })
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success(`批量启用成功！`)
      }, 500)
    } catch (error) {
      console.error('批量启用用户失败:', error)
      ElMessage.error('批量启用失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 批量删除
const batchDelete = () => {
  confirmDialogConfig.title = '批量删除确认'
  confirmDialogConfig.message = `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`
  confirmDialogConfig.type = 'danger'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.batchDeleteUsers(selectedUsers.value.map(user => user.id))
      
      // 模拟操作成功
      setTimeout(() => {
        // 从列表中移除已删除的用户
        const deletedIds = selectedUsers.value.map(user => user.id)
        usersList.value = usersList.value.filter(user => !deletedIds.includes(user.id))
        
        // 更新分页总数
        pagination.total -= selectedUsers.value.length
        
        // 清空选中项
        selectedUsers.value = []
        
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success('批量删除成功！')
      }, 500)
    } catch (error) {
      console.error('批量删除用户失败:', error)
      ElMessage.error('批量删除失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 处理更多操作
const handleCommand = (command, user) => {
  switch (command) {
    case 'resetPassword':
      resetPassword(user)
      break
    case 'delete':
      deleteUser(user)
      break
  }
}

// 重置密码
const resetPassword = (user) => {
  confirmDialogConfig.title = '重置密码确认'
  confirmDialogConfig.message = `确定要重置用户 ${user.username} 的密码吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.resetUserPassword(user.id)
      
      // 模拟操作成功
      setTimeout(() => {
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success(`密码重置成功！新密码已发送至用户邮箱。`)
      }, 500)
    } catch (error) {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}

// 删除用户
const deleteUser = (user) => {
  confirmDialogConfig.title = '删除确认'
  confirmDialogConfig.message = `确定要删除用户 ${user.username} 吗？此操作不可恢复！`
  confirmDialogConfig.type = 'danger'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.deleteUser(user.id)
      
      // 模拟操作成功
      setTimeout(() => {
        // 从列表中移除已删除的用户
        usersList.value = usersList.value.filter(item => item.id !== user.id)
        
        // 更新分页总数
        pagination.total -= 1
        
        confirmDialogVisible.value = false
        confirmDialogConfig.loading = false
        ElMessage.success('删除成功！')
      }, 500)
    } catch (error) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败，请重试')
      confirmDialogConfig.loading = false
    }
  }
  confirmDialogConfig.onCancel = () => {
    confirmDialogVisible.value = false
  }
  
  confirmDialogVisible.value = true
}
</script>

<style scoped>
.admin-users-page {
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

.role-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.el-button + .el-button {
  margin-left: 10px;
}
</style> 