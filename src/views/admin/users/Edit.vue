<template>
  <div class="edit-user-page">
    <el-card class="page-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <h1>编辑管理员用户</h1>
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
        class="edit-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" disabled></el-input>
          <div class="form-tip">用户名创建后不可修改</div>
        </el-form-item>

        <el-form-item label="姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入姓名"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="不修改请留空" show-password></el-input>
          <div class="form-tip">如需修改密码请输入新密码，不修改请留空</div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="不修改请留空" show-password></el-input>
        </el-form-item>

        <el-form-item label="角色" prop="roles">
          <el-select
            v-model="formData.roles"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userId = route.params.id

// 表单相关
const formRef = ref(null)
const loading = ref(true)
const submitting = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  username: '',
  realName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  roles: [],
  status: 'active',
  remark: ''
})

// 表单验证规则
const formRules = reactive({
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: ['blur', 'change'] }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { 
      validator: (rule, value, callback) => {
        if (formData.password && value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: ['blur', 'change'] 
    }
  ],
  roles: [
    { required: true, message: '请至少选择一个角色', trigger: 'change' }
  ]
})

// 角色选项
const roleOptions = ref([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '财务管理员' },
  { id: 3, name: '客服专员' },
  { id: 4, name: '商品管理员' },
  { id: 5, name: '订单管理员' }
])

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
    // const userData = response.data
    // formData.id = userData.id
    // formData.username = userData.username
    // formData.realName = userData.realName
    // formData.email = userData.email
    // formData.phone = userData.phone
    // formData.roles = userData.roles.map(role => role.id)
    // formData.status = userData.status
    // formData.remark = userData.remark
    
    // 模拟数据
    setTimeout(() => {
      const userData = {
        id: userId,
        username: `admin${userId}`,
        realName: `管理员${userId}`,
        email: `admin${userId}@example.com`,
        phone: `1358888${userId.toString().padStart(4, '0')}`,
        roles: [
          { id: 1, name: '超级管理员' },
          { id: 2, name: '财务管理员' }
        ],
        status: 'active',
        remark: '这是一个测试用户账号，拥有超级管理员和财务管理员角色。'
      }
      
      formData.id = userData.id
      formData.username = userData.username
      formData.realName = userData.realName
      formData.email = userData.email
      formData.phone = userData.phone
      formData.roles = userData.roles.map(role => role.id)
      formData.status = userData.status
      formData.remark = userData.remark
      
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败，请重试')
    loading.value = false
  }
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
      // 构建提交数据，移除确认密码字段
      const submitData = { ...formData }
      delete submitData.confirmPassword
      
      // 如果密码为空，则不提交密码字段
      if (!submitData.password) {
        delete submitData.password
      }
      
      // 这里模拟API调用，实际项目中应替换为真实API
      // await api.updateUser(submitData)
      
      // 模拟操作成功
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('保存成功！')
        router.push(`/admin/users/${userId}`)
      }, 500)
    } catch (error) {
      console.error('保存用户失败:', error)
      ElMessage.error('保存失败，请重试')
      submitting.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    loadUserData() // 重新加载原始数据
  }
}

// 返回用户详情
const goBack = () => {
  router.push(`/admin/users/${userId}`)
}
</script>

<style scoped>
.edit-user-page {
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

.role-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 