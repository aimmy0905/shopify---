<template>
  <div class="my-referrals">
    <!-- 下级用户统计卡片 -->
    <div class="referral-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">一级下级总数</div>
          <div class="stat-value">{{ referrals.stats.level1Count }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">二级下级总数</div>
          <div class="stat-value">{{ referrals.stats.level2Count }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月新增下级数</div>
          <div class="stat-value new">{{ referrals.stats.monthlyNew }}</div>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchText"
        placeholder="搜索用户名或邮箱"
        @input="handleSearch"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 下级用户列表 -->
    <div class="referral-list">
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <el-empty description="暂无下级用户数据" />
      </div>
      
      <div v-else>
        <div v-for="user in paginatedUsers" :key="user.id" class="user-item">
          <!-- 一级用户 -->
          <div class="level1-user">
            <div class="user-info">
              <div class="user-avatar">
                <el-icon><User /></el-icon>
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-meta">
                  <span class="join-time">加入时间: {{ formatDate(user.joinTime) }}</span>
                  <span class="commission-total">贡献佣金: ${{ user.totalCommission.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div class="user-actions">
              <el-button 
                v-if="user.level2Count > 0"
                text 
                @click="toggleLevel2Users(user.id)"
              >
                <el-icon>
                  <ArrowDown v-if="!expandedUsers.includes(user.id)" />
                  <ArrowUp v-else />
                </el-icon>
                {{ user.level2Count }}个二级用户
              </el-button>
              <el-button text @click="viewUserDetail(user)">查看详情</el-button>
            </div>
          </div>

          <!-- 二级用户列表 -->
          <div 
            v-if="expandedUsers.includes(user.id) && user.level2Users.length > 0"
            class="level2-users"
          >
            <div 
              v-for="level2User in user.level2Users" 
              :key="level2User.id"
              class="level2-user"
            >
              <div class="user-info">
                <div class="user-avatar level2">
                  <el-icon><User /></el-icon>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ level2User.name }}</div>
                  <div class="user-meta">
                    <span class="join-time">加入时间: {{ formatDate(level2User.joinTime) }}</span>
                    <span class="commission-total">贡献佣金: ${{ level2User.totalCommission.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="user-actions">
                <el-button text @click="viewUserDetail(level2User)">查看详情</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件 -->
    <div v-if="filteredUsers.length > 0" class="pagination-wrapper">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredUsers.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户详情弹窗 -->
    <user-detail-dialog 
      v-model="showDetailDialog" 
      :user="selectedUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, User, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import UserDetailDialog from './UserDetailDialog.vue'

// Props
const props = defineProps({
  referrals: {
    type: Object,
    default: () => ({
      stats: {
        level1Count: 0,
        level2Count: 0,
        monthlyNew: 0
      },
      users: []
    })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['search'])

// 响应式数据
const searchText = ref('')
const expandedUsers = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailDialog = ref(false)
const selectedUser = ref(null)

// 计算属性
const filteredUsers = computed(() => {
  if (!searchText.value) {
    return props.referrals.users
  }
  
  return props.referrals.users.filter(user => {
    // 搜索一级用户
    if (user.name.toLowerCase().includes(searchText.value.toLowerCase())) {
      return true
    }
    
    // 搜索二级用户
    return user.level2Users.some(level2User => 
      level2User.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  })
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 方法
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchText.value)
}

const toggleLevel2Users = (userId) => {
  const index = expandedUsers.value.indexOf(userId)
  if (index > -1) {
    expandedUsers.value.splice(index, 1)
  } else {
    expandedUsers.value.push(userId)
  }
}

const viewUserDetail = (user) => {
  selectedUser.value = user
  showDetailDialog.value = true
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 监听器
watch(() => props.referrals, () => {
  currentPage.value = 1
  expandedUsers.value = []
}, { deep: true })
</script>

<style scoped>
.my-referrals {
  padding: 16px 0;
}

/* 统计卡片 */
.referral-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.new {
  color: #409eff;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 20px;
}

.search-section .el-input {
  max-width: 400px;
}

/* 用户列表 */
.referral-list {
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.user-item {
  border-bottom: 1px solid #f0f2f5;
}

.user-item:last-child {
  border-bottom: none;
}

/* 一级用户 */
.level1-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fafbfc;
}

.level1-user:hover {
  background: #f5f7fa;
}

/* 二级用户 */
.level2-users {
  background: white;
}

.level2-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 12px 60px;
  border-bottom: 1px solid #f0f2f5;
  position: relative;
}

.level2-user:last-child {
  border-bottom: none;
}

.level2-user::before {
  content: '';
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e4e7ed;
}

.level2-user::after {
  content: '';
  position: absolute;
  left: 40px;
  top: 24px;
  width: 12px;
  height: 1px;
  background: #e4e7ed;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.user-avatar.level2 {
  width: 32px;
  height: 32px;
  background: #67c23a;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  color: #303133;
  font-size: 16px;
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.commission-total {
  color: #67c23a;
  font-weight: 500;
}

/* 用户操作 */
.user-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .level1-user,
  .level2-user {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .user-actions {
    align-self: flex-end;
  }
  
  .user-meta {
    flex-direction: column;
    gap: 4px;
  }
  
  .level2-user {
    padding-left: 40px;
  }
  
  .level2-user::before,
  .level2-user::after {
    display: none;
  }
}
</style> 