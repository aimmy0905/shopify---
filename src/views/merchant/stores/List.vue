<template>
  <div class="stores-list">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h1>我的店铺</h1>
      <el-button type="primary" @click="handleAddStore">
        <el-icon><Plus /></el-icon>
        添加店铺
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="请输入店铺名称进行搜索"
        clearable
        @input="handleSearch"
        style="width: 300px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 店铺列表 -->
    <div v-if="!loading && storeList.length > 0" class="stores-grid">
      <div
        v-for="store in displayStores"
        :key="store.id"
        class="store-card"
        @click="viewStoreDetail(store.id)"
      >
        <div class="store-header">
          <div class="store-info">
            <h3 class="store-name">{{ store.name }}</h3>
            <div class="store-url">
              <el-link :href="store.url" target="_blank" type="primary">
                {{ store.url }}
              </el-link>
            </div>
            <div class="store-meta">
              <span class="store-id">店铺ID: {{ store.shopify_id }}</span>
            </div>
          </div>
          <div class="store-status">
            <el-tag
              :type="store.status === 'active' ? 'success' : 'danger'"
              size="small"
            >
              {{ store.status === 'active' ? '正常' : '已过期' }}
            </el-tag>
          </div>
        </div>

        <div class="store-footer">
          <div class="add-time">
            <el-icon><Calendar /></el-icon>
            <span>{{ formatDate(store.created_at) }}</span>
          </div>
          <div class="store-actions" @click.stop>
            <el-button
              size="small"
              type="primary"
              @click="viewStoreDetail(store.id)"
            >
              进入详情
            </el-button>
            <el-dropdown @command="handleStoreAction">
              <el-button size="small" type="text">
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="`reauth_${store.id}`">
                    重新授权
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="`delete_${store.id}`"
                    style="color: #f56c6c"
                  >
                    删除店铺
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading && storeList.length === 0" class="empty-state">
      <el-empty description="您尚未添加店铺">
        <el-button type="primary" @click="handleAddStore">
          添加第一个店铺
        </el-button>
      </el-empty>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 分页控件 -->
    <div v-if="!loading && storeList.length > 0" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Calendar,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 店铺列表数据（模拟数据，实际项目中从API获取）
const storeList = ref([
  {
    id: 1,
    name: 'Fashion Store',
    url: 'https://fashion-store.myshopify.com',
    shopify_id: 'shop_12345',
    status: 'active',
    created_at: '2023-12-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Tech Gadgets',
    url: 'https://tech-gadgets.myshopify.com',
    shopify_id: 'shop_67890',
    status: 'expired',
    created_at: '2023-11-15T14:30:00Z'
  },
  {
    id: 3,
    name: 'Home & Garden',
    url: 'https://home-garden.myshopify.com',
    shopify_id: 'shop_54321',
    status: 'active',
    created_at: '2023-10-20T09:15:00Z'
  }
])

// 计算属性：过滤后的店铺列表
const filteredStores = computed(() => {
  if (!searchQuery.value) {
    return storeList.value
  }
  return storeList.value.filter(store =>
    store.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 计算属性：当前页显示的店铺
const displayStores = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStores.value.slice(start, end)
})

// 方法
const handleAddStore = () => {
  router.push('/merchant/stores/add')
}

const viewStoreDetail = (storeId) => {
  router.push(`/merchant/stores/${storeId}`)
}

const handleSearch = () => {
  currentPage.value = 1
  total.value = filteredStores.value.length
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

const handleStoreAction = async (command) => {
  const [action, storeId] = command.split('_')
  
  if (action === 'reauth') {
    ElMessage.info('重新授权功能开发中')
  } else if (action === 'delete') {
    try {
      await ElMessageBox.confirm(
        '删除后将无法恢复，确定要删除此店铺吗？',
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
      
      // 这里应该调用删除API
      const index = storeList.value.findIndex(store => store.id === parseInt(storeId))
      if (index > -1) {
        storeList.value.splice(index, 1)
        ElMessage.success('店铺删除成功')
        total.value = filteredStores.value.length
      }
    } catch {
      // 用户取消删除
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  total.value = storeList.value.length
})
</script>

<style lang="scss" scoped>
.stores-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .search-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .stores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .store-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .store-info {
        flex: 1;

        .store-name {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }

        .store-url {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .store-meta {
          .store-id {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }

    .store-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;

      .add-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #6b7280;
      }

      .store-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .empty-state {
    background: white;
    border-radius: 8px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .loading-state {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }
}
</style> 