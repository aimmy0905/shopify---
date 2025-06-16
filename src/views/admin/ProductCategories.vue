<template>
  <div class="categories-container">
    <a-card class="categories-card" title="商品分类管理" :bordered="false">
      <!-- 操作按钮区域 -->
      <template #extra>
        <a-space>
          <a-button type="primary" @click="addCategory">
            <template #icon><PlusOutlined /></template>
            新增分类
          </a-button>
          <a-button @click="expandAll">
            <template #icon><UnorderedListOutlined /></template>
            {{ allExpanded ? '收起全部' : '展开全部' }}
          </a-button>
        </a-space>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索分类名称"
          allow-clear
          @search="handleSearch"
          style="width: 300px; margin-bottom: 16px;"
        />
      </div>

      <!-- 分类列表 -->
      <a-table
        :columns="columns"
        :row-key="record => record.id"
        :data-source="categoryList"
        :loading="loading"
        :pagination="false"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
        :default-expand-all-rows="allExpanded"
        :expanded-row-keys="expandedKeys"
        @expand="onExpand"
        @expandedRowsChange="onExpandedRowsChange"
        :indentSize="20"
      >
        <template #bodyCell="{ column, record }">
          <!-- 分类名称列 -->
          <template v-if="column.key === 'name'">
            <div class="category-name-cell">
              <a-image
                v-if="record.icon"
                :width="20"
                :height="20"
                :src="record.icon"
                :preview="false"
                style="margin-right: 8px;"
              />
              <FolderOutlined v-else style="margin-right: 8px; color: #faad14;" />
              <span>{{ record.name }}</span>
              <a-tag v-if="record.level" size="small" :color="getLevelColor(record.level)">
                {{ getLevelText(record.level) }}
              </a-tag>
            </div>
          </template>

          <!-- 商品数量列 -->
          <template v-if="column.key === 'productCount'">
            <a @click="viewCategoryProducts(record)">{{ record.productCount }}</a>
          </template>

          <!-- 状态列 -->
          <template v-if="column.key === 'status'">
            <a-switch
              v-model:checked="record.isActive"
              :loading="record.statusLoading"
              @change="toggleStatus(record)"
            />
          </template>

          <!-- 排序列 -->
          <template v-if="column.key === 'sort'">
            <a-input-number
              v-model:value="record.sort"
              :min="0"
              :max="9999"
              size="small"
              @change="updateSort(record)"
              style="width: 80px;"
            />
          </template>

          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a @click="addSubCategory(record)">添加子分类</a>
              <a-divider type="vertical" />
              <a @click="editCategory(record)">编辑</a>
              <a-divider type="vertical" />
              <a-dropdown>
                <a @click.prevent>
                  更多
                  <DownOutlined />
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="viewCategoryProducts(record)">
                      <EyeOutlined /> 查看商品
                    </a-menu-item>
                    <a-menu-item @click="moveCategory(record)">
                      <DragOutlined /> 移动分类
                    </a-menu-item>
                    <a-menu-item danger @click="deleteCategory(record)">
                      <DeleteOutlined /> 删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 批量操作 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-operations">
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 个分类`"
          type="info"
          show-icon
          style="margin-top: 16px;"
        >
          <template #action>
            <a-space>
              <a-button size="small" @click="batchEnable">批量启用</a-button>
              <a-button size="small" @click="batchDisable">批量禁用</a-button>
              <a-button size="small" danger @click="batchDelete">批量删除</a-button>
            </a-space>
          </template>
        </a-alert>
      </div>
    </a-card>

    <!-- 新增/编辑分类弹窗 -->
    <a-modal
      v-model:visible="categoryModalVisible"
      :title="categoryForm.id ? '编辑分类' : '新增分类'"
      @ok="handleCategorySubmit"
      @cancel="resetCategoryForm"
      width="600px"
    >
      <a-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="上级分类" name="parentId">
          <a-tree-select
            v-model:value="categoryForm.parentId"
            :tree-data="parentCategoryOptions"
            placeholder="请选择上级分类（留空为顶级分类）"
            tree-node-filter-prop="title"
            allow-clear
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
          />
        </a-form-item>
        
        <a-form-item label="分类名称" name="name">
          <a-input v-model:value="categoryForm.name" placeholder="请输入分类名称" />
        </a-form-item>
        
        <a-form-item label="分类图标" name="icon">
          <div class="icon-upload">
            <a-upload
              :file-list="iconFileList"
              :before-upload="beforeIconUpload"
              @change="handleIconChange"
              @remove="handleIconRemove"
              list-type="picture-card"
              class="icon-uploader"
              :show-upload-list="false"
            >
              <div v-if="categoryForm.icon" class="icon-preview">
                <img :src="categoryForm.icon" alt="icon" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div v-else class="upload-placeholder">
                <PlusOutlined />
                <div style="margin-top: 8px">上传图标</div>
              </div>
            </a-upload>
            <div v-if="categoryForm.icon" class="icon-actions">
              <a-button size="small" @click="previewIcon">
                <EyeOutlined />
              </a-button>
              <a-button size="small" danger @click="removeIcon">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>
        </a-form-item>
        
        <a-form-item label="排序值" name="sort">
          <a-input-number
            v-model:value="categoryForm.sort"
            :min="0"
            :max="9999"
            placeholder="数值越小越靠前"
            style="width: 100%;"
          />
        </a-form-item>
        
        <a-form-item label="分类描述" name="description">
          <a-textarea
            v-model:value="categoryForm.description"
            placeholder="请输入分类描述"
            :rows="3"
          />
        </a-form-item>
        
        <a-form-item label="是否显示" name="isActive">
          <a-switch v-model:checked="categoryForm.isActive" />
          <span style="margin-left: 8px; color: #666;">
            {{ categoryForm.isActive ? '显示' : '隐藏' }}
          </span>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 移动分类弹窗 -->
    <a-modal
      v-model:visible="moveModalVisible"
      title="移动分类"
      @ok="handleMoveCategory"
      @cancel="moveModalVisible = false"
    >
      <div style="margin-bottom: 16px;">
        <strong>当前分类：</strong>{{ moveForm.categoryName }}
      </div>
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="移动到">
          <a-tree-select
            v-model:value="moveForm.targetParentId"
            :tree-data="parentCategoryOptions"
            placeholder="请选择目标分类（留空为顶级分类）"
            tree-node-filter-prop="title"
            allow-clear
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  PlusOutlined,
  UnorderedListOutlined,
  FolderOutlined,
  DownOutlined,
  EyeOutlined,
  DragOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const categoryModalVisible = ref(false)
const moveModalVisible = ref(false)
const searchKeyword = ref('')
const allExpanded = ref(false)
const expandedKeys = ref([])
const selectedRowKeys = ref([])
const categoryFormRef = ref()

// 分类表单
const categoryForm = reactive({
  id: null,
  parentId: null,
  name: '',
  icon: '',
  sort: 0,
  description: '',
  isActive: true
})

// 移动表单
const moveForm = reactive({
  categoryId: null,
  categoryName: '',
  targetParentId: null
})

// 图标文件列表
const iconFileList = ref([])

// 分类列表数据
const categoryList = ref([])

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 表格列配置
const columns = [
  {
    title: '分类名称',
    key: 'name',
    width: 300
  },
  {
    title: '分类编号',
    dataIndex: 'code',
    key: 'code',
    width: 120
  },
  {
    title: '商品数量',
    key: 'productCount',
    width: 100
  },
  {
    title: '排序',
    key: 'sort',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 上级分类选项
const parentCategoryOptions = computed(() => {
  const buildTreeOptions = (categories, level = 0) => {
    return categories.map(cat => ({
      title: cat.name,
      value: cat.id,
      key: cat.id,
      disabled: categoryForm.id === cat.id, // 禁止选择自己作为父级
      children: cat.children ? buildTreeOptions(cat.children, level + 1) : []
    }))
  }
  return buildTreeOptions(categoryList.value)
})

// 初始化模拟数据
const initCategoryData = () => {
  return [
    {
      id: 1,
      code: 'CAT001',
      name: '电子产品',
      icon: 'https://picsum.photos/40/40?random=1',
      level: 1,
      sort: 1,
      productCount: 156,
      isActive: true,
      createdAt: '2023-01-15',
      children: [
        {
          id: 11,
          code: 'CAT011',
          name: '手机配件',
          icon: 'https://picsum.photos/40/40?random=11',
          level: 2,
          sort: 1,
          productCount: 89,
          isActive: true,
          createdAt: '2023-01-16',
          children: [
            {
              id: 111,
              code: 'CAT111',
              name: '手机壳',
              level: 3,
              sort: 1,
              productCount: 45,
              isActive: true,
              createdAt: '2023-01-17'
            },
            {
              id: 112,
              code: 'CAT112',
              name: '充电器',
              level: 3,
              sort: 2,
              productCount: 34,
              isActive: true,
              createdAt: '2023-01-18'
            }
          ]
        },
        {
          id: 12,
          code: 'CAT012',
          name: '数码相机',
          icon: 'https://picsum.photos/40/40?random=12',
          level: 2,
          sort: 2,
          productCount: 67,
          isActive: true,
          createdAt: '2023-01-19'
        }
      ]
    },
    {
      id: 2,
      code: 'CAT002',
      name: '服装配饰',
      icon: 'https://picsum.photos/40/40?random=2',
      level: 1,
      sort: 2,
      productCount: 203,
      isActive: true,
      createdAt: '2023-01-20',
      children: [
        {
          id: 21,
          code: 'CAT021',
          name: '男装',
          level: 2,
          sort: 1,
          productCount: 98,
          isActive: true,
          createdAt: '2023-01-21'
        },
        {
          id: 22,
          code: 'CAT022',
          name: '女装',
          level: 2,
          sort: 2,
          productCount: 105,
          isActive: true,
          createdAt: '2023-01-22'
        }
      ]
    },
    {
      id: 3,
      code: 'CAT003',
      name: '家居用品',
      icon: 'https://picsum.photos/40/40?random=3',
      level: 1,
      sort: 3,
      productCount: 134,
      isActive: false,
      createdAt: '2023-01-23'
    },
    {
      id: 4,
      code: 'CAT004',
      name: '运动户外',
      icon: 'https://picsum.photos/40/40?random=4',
      level: 1,
      sort: 4,
      productCount: 78,
      isActive: true,
      createdAt: '2023-01-24'
    },
    {
      id: 5,
      code: 'CAT005',
      name: '美妆护肤',
      icon: 'https://picsum.photos/40/40?random=5',
      level: 1,
      sort: 5,
      productCount: 92,
      isActive: true,
      createdAt: '2023-01-25'
    }
  ]
}

// 获取层级颜色
const getLevelColor = (level) => {
  const colors = { 1: 'blue', 2: 'green', 3: 'orange' }
  return colors[level] || 'default'
}

// 获取层级文本
const getLevelText = (level) => {
  const texts = { 1: '一级', 2: '二级', 3: '三级' }
  return texts[level] || '未知'
}

// 加载分类数据
const loadCategories = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    let data = initCategoryData()
    
    // 搜索过滤
    if (searchKeyword.value) {
      data = filterCategories(data, searchKeyword.value)
    }
    
    categoryList.value = data
  } catch (error) {
    message.error('加载分类数据失败')
  } finally {
    loading.value = false
  }
}

// 过滤分类数据
const filterCategories = (categories, keyword) => {
  const result = []
  categories.forEach(category => {
    if (category.name.includes(keyword)) {
      result.push(category)
    } else if (category.children) {
      const filteredChildren = filterCategories(category.children, keyword)
      if (filteredChildren.length > 0) {
        result.push({
          ...category,
          children: filteredChildren
        })
      }
    }
  })
  return result
}

// 搜索处理
const handleSearch = () => {
  loadCategories()
}

// 展开/收起全部
const expandAll = () => {
  allExpanded.value = !allExpanded.value
  if (allExpanded.value) {
    const getAllKeys = (categories) => {
      let keys = []
      categories.forEach(cat => {
        keys.push(cat.id)
        if (cat.children) {
          keys = keys.concat(getAllKeys(cat.children))
        }
      })
      return keys
    }
    expandedKeys.value = getAllKeys(categoryList.value)
  } else {
    expandedKeys.value = []
  }
}

// 展开事件
const onExpand = (expanded, record) => {
  if (expanded) {
    expandedKeys.value.push(record.id)
  } else {
    expandedKeys.value = expandedKeys.value.filter(key => key !== record.id)
  }
}

// 展开行变化
const onExpandedRowsChange = (keys) => {
  expandedKeys.value = keys
}

// 选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 添加分类
const addCategory = () => {
  resetCategoryForm()
  categoryModalVisible.value = true
}

// 添加子分类
const addSubCategory = (parent) => {
  resetCategoryForm()
  categoryForm.parentId = parent.id
  categoryModalVisible.value = true
}

// 编辑分类
const editCategory = (record) => {
  Object.assign(categoryForm, {
    id: record.id,
    parentId: record.parentId || null,
    name: record.name,
    icon: record.icon || '',
    sort: record.sort,
    description: record.description || '',
    isActive: record.isActive
  })
  categoryModalVisible.value = true
}

// 重置表单
const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    id: null,
    parentId: null,
    name: '',
    icon: '',
    sort: 0,
    description: '',
    isActive: true
  })
  iconFileList.value = []
  categoryFormRef.value?.resetFields()
}

// 提交分类表单
const handleCategorySubmit = async () => {
  try {
    await categoryFormRef.value.validate()
    
    const action = categoryForm.id ? '更新' : '创建'
    message.success(`分类${action}成功`)
    categoryModalVisible.value = false
    resetCategoryForm()
    loadCategories()
  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

// 切换状态
const toggleStatus = async (record) => {
  record.statusLoading = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    message.success(`分类${record.isActive ? '启用' : '禁用'}成功`)
  } catch (error) {
    record.isActive = !record.isActive // 回滚状态
    message.error('状态更新失败')
  } finally {
    record.statusLoading = false
  }
}

// 更新排序
const updateSort = async (record) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    message.success('排序更新成功')
  } catch (error) {
    message.error('排序更新失败')
  }
}

// 查看分类商品
const viewCategoryProducts = (record) => {
  router.push(`/admin/products?categoryId=${record.id}`)
}

// 移动分类
const moveCategory = (record) => {
  moveForm.categoryId = record.id
  moveForm.categoryName = record.name
  moveForm.targetParentId = null
  moveModalVisible.value = true
}

// 处理移动分类
const handleMoveCategory = async () => {
  try {
    message.success('分类移动成功')
    moveModalVisible.value = false
    loadCategories()
  } catch (error) {
    message.error('移动失败')
  }
}

// 删除分类
const deleteCategory = (record) => {
  Modal.confirm({
    title: '删除分类',
    content: `确定要删除分类 "${record.name}" 吗？${record.children ? '删除后子分类也会一并删除。' : ''}此操作不可恢复。`,
    onOk: async () => {
      try {
        message.success('分类删除成功')
        loadCategories()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 批量操作
const batchEnable = () => {
  Modal.confirm({
    title: '批量启用',
    content: `确定要启用选中的 ${selectedRowKeys.value.length} 个分类吗？`,
    onOk: async () => {
      try {
        message.success(`批量启用成功，共处理 ${selectedRowKeys.value.length} 个分类`)
        selectedRowKeys.value = []
        loadCategories()
      } catch (error) {
        message.error('批量启用失败')
      }
    }
  })
}

const batchDisable = () => {
  Modal.confirm({
    title: '批量禁用',
    content: `确定要禁用选中的 ${selectedRowKeys.value.length} 个分类吗？`,
    onOk: async () => {
      try {
        message.success(`批量禁用成功，共处理 ${selectedRowKeys.value.length} 个分类`)
        selectedRowKeys.value = []
        loadCategories()
      } catch (error) {
        message.error('批量禁用失败')
      }
    }
  })
}

const batchDelete = () => {
  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个分类吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        message.success(`批量删除成功，共删除 ${selectedRowKeys.value.length} 个分类`)
        selectedRowKeys.value = []
        loadCategories()
      } catch (error) {
        message.error('批量删除失败')
      }
    }
  })
}

// 图标上传相关
const beforeIconUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleIconChange = (info) => {
  if (info.file.status === 'done') {
    categoryForm.icon = info.file.response.url
  }
}

const handleIconRemove = () => {
  categoryForm.icon = ''
  iconFileList.value = []
}

const previewIcon = () => {
  if (categoryForm.icon) {
    window.open(categoryForm.icon)
  }
}

const removeIcon = () => {
  categoryForm.icon = ''
  iconFileList.value = []
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.categories-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.search-wrapper {
  margin-bottom: 16px;
}

.category-name-cell {
  display: flex;
  align-items: center;
  
  .ant-tag {
    margin-left: 8px;
  }
}

.batch-operations {
  margin-top: 16px;
}

.icon-upload {
  display: flex;
  align-items: center;
  
  .icon-uploader {
    :deep(.ant-upload) {
      width: 80px;
      height: 80px;
    }
  }
  
  .icon-preview {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    color: #999;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #40a9ff;
    }
  }
  
  .icon-actions {
    margin-left: 12px;
    
    .ant-btn {
      margin-right: 8px;
    }
  }
}

:deep(.ant-table-tbody .ant-table-row-level-0 .ant-table-cell) {
  font-weight: 500;
}

:deep(.ant-table-tbody .ant-table-row-level-1 .ant-table-cell) {
  background-color: #fafafa;
}

:deep(.ant-table-tbody .ant-table-row-level-2 .ant-table-cell) {
  background-color: #f0f0f0;
}
</style> 