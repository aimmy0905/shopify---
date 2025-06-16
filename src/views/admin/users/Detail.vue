<template>
  <div class="user-detail-page">
    <el-card class="page-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h1>管理员用户详情</h1>
          <div class="header-actions">
            <el-button @click="editUser" type="primary">编辑</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <div class="user-info" v-if="userData">
        <div class="user-info-header">
          <div class="user-avatar">
            <el-avatar :size="80" :src="userData.avatar">
              {{ userData.realName ? userData.realName.substring(0, 1) : 'U' }}
            </el-avatar>
          </div>
          <div class="user-status">
            <el-tag :type="userData.status === 'active' ? 'success' : 'danger'" size="large">
              {{ userData.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
            <div class="status-actions">
              <el-button 
                :type="userData.status === 'active' ? 'danger' : 'success'" 
                size="small"
                @click="toggleUserStatus"
              >
                {{ userData.status === 'active' ? '禁用账户' : '启用账户' }}
              </el-button>
              <el-button type="warning" size="small" @click="resetPassword">重置密码</el-button>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ userData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ userData.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ userData.realName }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userData.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userData.phone }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag 
              v-for="role in userData.roles" 
              :key="role.id" 
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ userData.lastLoginTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ userData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ userData.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">登录记录</div>
        <el-table
          v-loading="loginLogsLoading"
          :data="loginLogs"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="loginTime" label="登录时间" width="180"></el-table-column>
          <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
          <el-table-column prop="location" label="登录地点"></el-table-column>
          <el-table-column prop="device" label="设备信息"></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                {{ scope.row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            @size-change="handleLogSizeChange"
            @current-change="handleLogCurrentChange"
            :current-page="logPagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="logPagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="logPagination.total"
          >
          </el-pagination>
        </div>
      </div>

      <el-empty v-else description="未找到用户数据"></el-empty>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// 用户数据
const userData = ref(null)
const loading = ref(true)

// 登录日志相关
const loginLogs = ref([])
const loginLogsLoading = ref(false)
const logPagination = reactive({
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
  loadUserData()
})

// 加载用户数据
const loadUserData = async () => {
  loading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getUserDetail(userId)
    // userData.value = response.data
    
    // 模拟数据
    setTimeout(() => {
      userData.value = {
        id: userId,
        username: `admin${userId}`,
        realName: `管理员${userId}`,
        email: `admin${userId}@example.com`,
        phone: `1358888${userId.toString().padStart(4, '0')}`,
        avatar: '',
        roles: [
          { id: 1, name: '超级管理员' },
          { id: 2, name: '财务管理员' }
        ],
        status: 'active',
        lastLoginTime: new Date().toLocaleString(),
        createTime: new Date(Date.now() - 30 * 86400000).toLocaleString(),
        remark: '这是一个测试用户账号，拥有超级管理员和财务管理员角色。'
      }
      
      loading.value = false
      loadLoginLogs()
    }, 500)
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载用户详情失败，请重试')
    loading.value = false
  }
}

// 加载登录日志
const loadLoginLogs = async () => {
  loginLogsLoading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getUserLoginLogs(userId, logPagination.currentPage, logPagination.pageSize)
    // loginLogs.value = response.data
    // logPagination.total = response.total
    
    // 模拟数据
    setTimeout(() => {
      const logs = []
      const total = 35
      
      const startIndex = (logPagination.currentPage - 1) * logPagination.pageSize
      const endIndex = Math.min(startIndex + logPagination.pageSize, total)
      
      for (let i = startIndex; i < endIndex; i++) {
        logs.push({
          id: i + 1,
          userId: userId,
          loginTime: new Date(Date.now() - i * 3600000).toLocaleString(),
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          location: ['北京市', '上海市', '广州市', '深圳市', '杭州市'][Math.floor(Math.random() * 5)],
          device: ['Chrome / Windows 10', 'Safari / macOS', 'Firefox / Ubuntu', 'Edge / Windows 11', 'Chrome / Android'][Math.floor(Math.random() * 5)],
          status: Math.random() > 0.2 ? 'success' : 'failed'
        })
      }
      
      loginLogs.value = logs
      logPagination.total = total
      loginLogsLoading.value = false
    }, 500)
  } catch (error) {
    console.error('加载登录日志失败:', error)
    ElMessage.error('加载登录日志失败，请重试')
    loginLogsLoading.value = false
  }
}

// 编辑用户
const editUser = () => {
  router.push(`/admin/users/edit/${userId}`)
}

// 返回用户列表
const goBack = () => {
  router.push('/admin/users')
}

// 切换用户状态
const toggleUserStatus = () => {
  const action = userData.value.status === 'active' ? '禁用' : '启用'
  
  confirmDialogConfig.title = `${action}确认`
  confirmDialogConfig.message = `确定要${action}用户 ${userData.value.username} 吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.updateUserStatus(userId, userData.value.status === 'active' ? 'disabled' : 'active')
      
      // 模拟操作成功
      setTimeout(() => {
        userData.value.status = userData.value.status === 'active' ? 'disabled' : 'active'
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

// 重置密码
const resetPassword = () => {
  confirmDialogConfig.title = '重置密码确认'
  confirmDialogConfig.message = `确定要重置用户 ${userData.value.username} 的密码吗？`
  confirmDialogConfig.type = 'warning'
  confirmDialogConfig.loading = false
  confirmDialogConfig.onConfirm = async () => {
    confirmDialogConfig.loading = true
    
    try {
      // 模拟API调用
      // await api.resetUserPassword(userId)
      
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

// 日志分页尺寸变化
const handleLogSizeChange = (val) => {
  logPagination.pageSize = val
  loadLoginLogs()
}

// 日志页码变化
const handleLogCurrentChange = (val) => {
  logPagination.currentPage = val
  loadLoginLogs()
}
</script>

<style scoped>
.user-detail-page {
  padding: 20px;
}

.page-card {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.user-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-actions {
  margin-top: 10px;
}

.role-tag {
  margin-right: 5px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 30px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 