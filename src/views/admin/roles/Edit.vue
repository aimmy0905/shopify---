<template>
  <div class="edit-role-page">
    <el-card class="page-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h1>编辑角色</h1>
          <div class="header-actions">
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="role-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-form 
            ref="formRef" 
            :model="formData" 
            :rules="formRules" 
            label-width="100px" 
            class="edit-form"
          >
            <el-form-item label="角色名称" prop="name">
              <el-input 
                v-model="formData.name" 
                placeholder="请输入角色名称"
                :disabled="formData.isSystem"
              ></el-input>
              <div class="form-tip" v-if="formData.isSystem">系统预设角色名称不可修改</div>
            </el-form-item>
            
            <el-form-item label="角色描述" prop="description">
              <el-input 
                v-model="formData.description" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入角色描述"
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="权限设置" name="permissions">
          <div class="permission-header">
            <span>请选择权限</span>
            <div class="permission-actions">
              <el-button size="small" @click="selectAllPermissions">全选</el-button>
              <el-button size="small" @click="unselectAllPermissions">全不选</el-button>
            </div>
          </div>
          
          <el-tree
            ref="permissionTree"
            :data="permissionOptions"
            show-checkbox
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            @check="handlePermissionCheck"
          />
          <div class="error-message" v-if="permissionError">{{ permissionError }}</div>
          
          <div class="permission-footer">
            <el-button type="primary" @click="savePermissions" :loading="permissionLoading">保存权限设置</el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="角色用户" name="users">
          <el-table
            v-loading="usersLoading"
            :data="roleUsers"
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
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const permissionTree = ref(null)
const loading = ref(true)
const submitting = ref(false)
const permissionLoading = ref(false)
const usersLoading = ref(false)
const permissionError = ref('')
const roleId = route.params.id
const activeTab = ref(route.query.tab || 'basic')

// 表单数据
const formData = reactive({
  id: '',
  name: '',
  description: '',
  isSystem: false,
  permissions: [],
  userCount: 0
})

// 表单验证规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
})

// 原始表单数据（用于重置）
let originalFormData = {}

// 角色用户相关
const roleUsers = ref([])
const userPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟权限数据结构
const permissionOptions = [
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 101, name: '用户管理-查看' },
      { id: 102, name: '用户管理-创建' },
      { id: 103, name: '用户管理-编辑' },
      { id: 104, name: '用户管理-删除' },
      { id: 105, name: '角色管理-查看' },
      { id: 106, name: '角色管理-创建' },
      { id: 107, name: '角色管理-编辑' },
      { id: 108, name: '角色管理-删除' },
      { id: 109, name: '系统设置' }
    ]
  },
  {
    id: 2,
    name: '商家管理',
    children: [
      { id: 201, name: '商家列表-查看' },
      { id: 202, name: '商家详情-查看' },
      { id: 203, name: '商家账户-禁用/启用' },
      { id: 204, name: '商家佣金-查看' },
      { id: 205, name: '商家佣金-结算' }
    ]
  },
  {
    id: 3,
    name: '商品管理',
    children: [
      { id: 301, name: '商品列表-查看' },
      { id: 302, name: '商品-创建' },
      { id: 303, name: '商品-编辑' },
      { id: 304, name: '商品-删除' },
      { id: 305, name: '商品-审核' },
      { id: 306, name: '商品分类-管理' }
    ]
  },
  {
    id: 4,
    name: '订单管理',
    children: [
      { id: 401, name: '店铺订单-查看' },
      { id: 402, name: '店铺订单-导出' },
      { id: 403, name: '采购订单-查看' },
      { id: 404, name: '采购订单-创建' },
      { id: 405, name: '采购订单-发货' },
      { id: 406, name: '采购订单-导出' }
    ]
  },
  {
    id: 5,
    name: '财务管理',
    children: [
      { id: 501, name: '余额记录-查看' },
      { id: 502, name: '充值审核-查看' },
      { id: 503, name: '充值审核-处理' },
      { id: 504, name: '提现管理-查看' },
      { id: 505, name: '提现管理-审核' },
      { id: 506, name: '提现管理-转账确认' },
      { id: 507, name: '佣金结算-查看' },
      { id: 508, name: '佣金结算-操作' }
    ]
  }
]

// 加载角色数据
onMounted(() => {
  loadRoleData()
  
  // 如果有指定的标签页，切换到对应标签页
  if (route.query.tab === 'permissions') {
    activeTab.value = 'permissions'
  } else if (route.query.tab === 'users') {
    activeTab.value = 'users'
  }
})

// 监听标签页变化，加载对应数据
const watchActiveTab = async (tab) => {
  if (tab === 'permissions') {
    await nextTick()
    if (permissionTree.value) {
      permissionTree.value.setCheckedKeys(formData.permissions)
    }
  } else if (tab === 'users') {
    loadRoleUsers()
  }
}

// 监听标签页变化
watch(activeTab, watchActiveTab)

// 加载角色数据
const loadRoleData = async () => {
  loading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getRoleDetail(roleId)
    // const roleData = response.data
    // formData.id = roleData.id
    // formData.name = roleData.name
    // formData.description = roleData.description
    // formData.permissions = roleData.permissions
    // formData.isSystem = roleData.isSystem
    // formData.userCount = roleData.userCount
    
    // 模拟数据
    setTimeout(() => {
      // 根据角色ID获取不同的数据
      let roleData = {}
      
      if (roleId === '1') { // 超级管理员
        roleData = {
          id: 1,
          name: '超级管理员',
          description: '系统最高权限，可以管理所有功能',
          permissions: [101, 102, 103, 104, 105, 106, 107, 108, 109, 201, 202, 203, 204, 205, 301, 302, 303, 304, 305, 306, 401, 402, 403, 404, 405, 406, 501, 502, 503, 504, 505, 506, 507, 508],
          isSystem: true,
          userCount: 2
        }
      } else if (roleId === '2') { // 财务管理员
        roleData = {
          id: 2,
          name: '财务管理员',
          description: '负责财务相关功能的管理',
          permissions: [101, 105, 501, 502, 503, 504, 505, 506, 507, 508],
          isSystem: true,
          userCount: 5
        }
      } else if (roleId === '3') { // 客服专员
        roleData = {
          id: 3,
          name: '客服专员',
          description: '负责客服工单和用户反馈的处理',
          permissions: [201, 202, 301, 401, 402, 403],
          isSystem: true,
          userCount: 8
        }
      } else if (roleId === '4') { // 商品管理员
        roleData = {
          id: 4,
          name: '商品管理员',
          description: '负责商品上架、审核和分类管理',
          permissions: [301, 302, 303, 304, 305, 306],
          isSystem: true,
          userCount: 4
        }
      } else if (roleId === '5') { // 订单管理员
        roleData = {
          id: 5,
          name: '订单管理员',
          description: '负责订单处理和物流跟踪',
          permissions: [401, 402, 403, 404, 405, 406],
          isSystem: true,
          userCount: 3
        }
      } else { // 自定义角色
        const roleIndex = parseInt(roleId) - 5
        roleData = {
          id: parseInt(roleId),
          name: `自定义角色${roleIndex}`,
          description: `这是一个自定义角色，ID为${roleId}`,
          permissions: [101, 105, 201, 301, 401],
          isSystem: false,
          userCount: Math.floor(Math.random() * 10)
        }
      }
      
      formData.id = roleData.id
      formData.name = roleData.name
      formData.description = roleData.description
      formData.permissions = roleData.permissions
      formData.isSystem = roleData.isSystem
      formData.userCount = roleData.userCount
      
      loading.value = false
      
      // 如果当前是权限标签页，初始化权限树
      if (activeTab.value === 'permissions') {
        nextTick(() => {
          if (permissionTree.value) {
            permissionTree.value.setCheckedKeys(formData.permissions)
          }
        })
      }
      
      // 如果当前是用户标签页，加载用户列表
      if (activeTab.value === 'users') {
        loadRoleUsers()
      }
    }, 500)
  } catch (error) {
    console.error('加载角色数据失败:', error)
    ElMessage.error('加载角色数据失败，请重试')
    loading.value = false
  }
}

// 处理权限选择
const handlePermissionCheck = (node, { checkedKeys }) => {
  formData.permissions = checkedKeys
  permissionError.value = formData.permissions.length === 0 ? '请至少选择一个权限' : ''
}

// 全选权限
const selectAllPermissions = () => {
  const allPermissionIds = getAllPermissionIds(permissionOptions)
  permissionTree.value.setCheckedKeys(allPermissionIds)
  formData.permissions = allPermissionIds
  permissionError.value = ''
}

// 全不选权限
const unselectAllPermissions = () => {
  permissionTree.value.setCheckedKeys([])
  formData.permissions = []
  permissionError.value = '请至少选择一个权限'
}

// 获取所有权限ID
const getAllPermissionIds = (permissions) => {
  let ids = []
  permissions.forEach(permission => {
    if (permission.children) {
      ids = [...ids, ...getAllPermissionIds(permission.children)]
    } else {
      ids.push(permission.id)
    }
  })
  return ids
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (!valid) {
      console.error('表单验证失败:', fields)
      return
    }
    
    submitting.value = true
    
    try {
      // 这里模拟API调用，实际项目中应替换为真实API
      // await api.updateRole({
      //   id: formData.id,
      //   name: formData.name,
      //   description: formData.description
      // })
      
      // 模拟操作成功
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('保存成功！')
      }, 500)
    } catch (error) {
      console.error('保存角色失败:', error)
      ElMessage.error('保存失败，请重试')
      submitting.value = false
    }
  })
}

// 保存权限设置
const savePermissions = async () => {
  // 检查权限是否选择
  if (formData.permissions.length === 0) {
    permissionError.value = '请至少选择一个权限'
    return
  }
  
  permissionLoading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // await api.updateRolePermissions(formData.id, formData.permissions)
    
    // 模拟操作成功
    setTimeout(() => {
      permissionLoading.value = false
      ElMessage.success('权限设置保存成功！')
    }, 500)
  } catch (error) {
    console.error('保存权限设置失败:', error)
    ElMessage.error('保存权限设置失败，请重试')
    permissionLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    loadRoleData() // 重新加载原始数据
  }
}

// 加载角色用户
const loadRoleUsers = async () => {
  if (formData.userCount === 0) {
    roleUsers.value = []
    return
  }
  
  usersLoading.value = true
  
  try {
    // 这里模拟API调用，实际项目中应替换为真实API
    // const response = await api.getRoleUsers({
    //   roleId: formData.id,
    //   page: userPagination.currentPage,
    //   pageSize: userPagination.pageSize
    // })
    // roleUsers.value = response.data
    // userPagination.total = response.total
    
    // 模拟获取用户数据
    setTimeout(() => {
      const users = []
      for (let i = 1; i <= formData.userCount; i++) {
        users.push({
          id: i * 100 + parseInt(roleId),
          username: `user${i}_role${roleId}`,
          realName: `用户${i}(角色${roleId})`,
          email: `user${i}_role${roleId}@example.com`,
          phone: `1358888${(i * 100 + parseInt(roleId)).toString().padStart(4, '0')}`,
          status: i % 3 === 0 ? 'disabled' : 'active',
          lastLoginTime: new Date(Date.now() - i * 3600000).toLocaleString()
        })
      }
      
      // 分页
      const start = (userPagination.currentPage - 1) * userPagination.pageSize
      const end = start + userPagination.pageSize
      
      roleUsers.value = users.slice(start, end)
      userPagination.total = users.length
      usersLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取角色用户列表失败:', error)
    ElMessage.error('获取角色用户列表失败，请重试')
    usersLoading.value = false
  }
}

// 角色用户分页处理
const handleUserSizeChange = (val) => {
  userPagination.pageSize = val
  loadRoleUsers()
}

const handleUserCurrentChange = (val) => {
  userPagination.currentPage = val
  loadRoleUsers()
}

// 查看用户详情
const viewUserDetail = (user) => {
  router.push(`/admin/users/${user.id}`)
}

// 返回角色列表
const goBack = () => {
  router.push('/admin/roles')
}
</script>

<style scoped>
.edit-role-page {
  padding: 20px;
}

.page-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-form {
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.role-tabs {
  margin-top: 20px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.permission-actions {
  display: flex;
  gap: 10px;
}

.permission-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 8px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 