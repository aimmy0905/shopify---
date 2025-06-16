<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="700px"
    append-to-body
  >
    <div class="permission-header">
      <span>请选择权限</span>
      <div class="permission-actions">
        <el-button size="small" @click="selectAllPermissions">全选</el-button>
        <el-button size="small" @click="unselectAllPermissions">全不选</el-button>
      </div>
    </div>
    
    <!-- 权限树形控件 -->
    <el-tree
      ref="permissionTree"
      :data="permissionOptions"
      show-checkbox
      node-key="id"
      :props="{ label: 'name', children: 'children' }"
      default-expand-all
      @check="handlePermissionCheck"
    />
    <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm" :loading="loading">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '分配权限'
  },
  loading: {
    type: Boolean,
    default: false
  },
  initialPermissions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const dialogVisible = ref(props.visible)
const permissionTree = ref(null)
const selectedPermissions = ref([...props.initialPermissions])
const errorMessage = ref('')

// 模拟权限数据结构 - 实际应该从API获取
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

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听dialogVisible变化并向父组件同步状态
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 初始化权限树
onMounted(() => {
  if (props.initialPermissions.length && permissionTree.value) {
    permissionTree.value.setCheckedKeys(props.initialPermissions)
  }
})

// 处理权限选择
const handlePermissionCheck = (node, { checkedKeys }) => {
  selectedPermissions.value = checkedKeys
  errorMessage.value = selectedPermissions.value.length === 0 ? '请至少选择一个权限' : ''
}

// 全选权限
const selectAllPermissions = () => {
  const allPermissionIds = getAllPermissionIds(permissionOptions)
  permissionTree.value.setCheckedKeys(allPermissionIds)
  selectedPermissions.value = allPermissionIds
  errorMessage.value = ''
}

// 全不选权限
const unselectAllPermissions = () => {
  permissionTree.value.setCheckedKeys([])
  selectedPermissions.value = []
  errorMessage.value = '请至少选择一个权限'
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

// 确认选择
const confirm = () => {
  if (selectedPermissions.value.length === 0) {
    errorMessage.value = '请至少选择一个权限'
    return
  }
  
  emit('confirm', selectedPermissions.value)
}

// 取消选择
const cancel = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>

<style scoped>
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