<template>
  <div class="create-role-page">
    <el-card class="page-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h1>创建角色</h1>
          <div class="header-actions">
            <el-button @click="goBack">返回</el-button>
          </div>
        </div>
      </template>

      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="formRules" 
        label-width="100px" 
        class="create-form"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入角色描述"
          ></el-input>
        </el-form-item>

        <el-form-item label="权限设置" prop="permissions">
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
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">创建</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 表单相关
const formRef = ref(null)
const permissionTree = ref(null)
const loading = ref(false)
const submitting = ref(false)
const permissionError = ref('')

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  permissions: []
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

// 权限选项
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
  
  // 检查权限是否选择
  if (formData.permissions.length === 0) {
    permissionError.value = '请至少选择一个权限'
    return
  }
  
  await formRef.value.validate(async (valid, fields) => {
    if (!valid) {
      console.error('表单验证失败:', fields)
      return
    }
    
    submitting.value = true
    
    try {
      // 这里模拟API调用，实际项目中应替换为真实API
      // await api.createRole(formData)
      
      // 模拟操作成功
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('创建角色成功！')
        router.push('/admin/roles')
      }, 500)
    } catch (error) {
      console.error('创建角色失败:', error)
      ElMessage.error('创建失败，请重试')
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    unselectAllPermissions()
  }
}

// 返回角色列表
const goBack = () => {
  router.push('/admin/roles')
}
</script>

<style scoped>
.create-role-page {
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

.create-form {
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

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 8px;
}
</style> 