<template>
  <div class="create-admin-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h1>添加管理员用户</h1>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>
      
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-position="top" 
        status-icon
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="formData.username" 
                placeholder="请输入用户名" 
                autocomplete="off"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="姓名" prop="realName">
              <el-input 
                v-model="formData.realName" 
                placeholder="请输入姓名"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="formData.password" 
                placeholder="请输入密码" 
                type="password" 
                autocomplete="new-password"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="formData.confirmPassword" 
                placeholder="请再次输入密码" 
                type="password" 
                autocomplete="new-password"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input 
                v-model="formData.email" 
                placeholder="请输入电子邮箱" 
                type="email"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input 
                v-model="formData.phone" 
                placeholder="请输入手机号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="角色" prop="roleIds">
          <el-select 
            v-model="formData.roleIds" 
            placeholder="请选择角色" 
            style="width: 100%"
            multiple
          >
            <el-option 
              v-for="role in roleOptions" 
              :key="role.id" 
              :label="role.name" 
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            :active-value="'active'"
            :inactive-value="'disabled'"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="formData.remark" 
            type="textarea" 
            rows="3" 
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-buttons">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="submitForm">创建用户</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const formData = reactive({
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 'active',
  remark: ''
})

// 角色选项
const roleOptions = [
  { id: 1, name: '超级管理员' },
  { id: 2, name: '财务管理员' },
  { id: 3, name: '客服专员' },
  { id: 4, name: '商品管理员' },
  { id: 5, name: '订单管理员' }
]

// 自定义校验规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (formData.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  roleIds: [
    { type: 'array', required: true, message: '请至少选择一个角色', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    // 这里应该是实际调用 API 创建用户
    // const response = await api.createAdminUser(formData)
    
    // 模拟创建成功
    setTimeout(() => {
      ElMessage({
        type: 'success',
        message: '创建管理员用户成功！'
      })
      
      // 创建成功后返回用户列表
      router.push('/admin/users')
    }, 500)
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败:', error)
  }
}

// 返回上一页
const goBack = () => {
  router.push('/admin/users')
}
</script>

<style scoped>
.create-admin-page {
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

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 