<template>
  <div class="merchant-referrals-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item>
          <router-link to="/admin/dashboard">首页</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link to="/admin/merchants">商家管理</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link :to="`/admin/merchants/${merchantId}`">商家详情</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>下级用户</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    
    <a-spin :spinning="loading">
      <div class="page-header">
        <div class="page-header-content">
          <h1 class="title">商家下级用户 - {{ merchantName }}</h1>
        </div>
        <div class="page-header-extra">
          <a-button @click="$router.go(-1)" style="margin-right: 8px;">
            返回
          </a-button>
          <a-button type="default" @click="exportData">
            <template #icon><DownloadOutlined /></template>
            导出
          </a-button>
        </div>
      </div>
      
      <!-- 下级用户统计卡片 -->
      <a-card :bordered="false" class="stat-card">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic 
              title="一级下级总数" 
              :value="referralStats.level1Count" 
              style="margin-right: 50px"
            >
              <template #prefix><TeamOutlined /></template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="二级下级总数" 
              :value="referralStats.level2Count" 
              style="margin-right: 50px"
            >
              <template #prefix><ClusterOutlined /></template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="一级下级贡献佣金($)" 
              :value="referralStats.level1Commission" 
              :precision="2"
              style="margin-right: 50px"
              class="primary-stat"
            >
              <template #prefix><DollarOutlined /></template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic 
              title="二级下级贡献佣金($)" 
              :value="referralStats.level2Commission" 
              :precision="2"
              class="primary-stat"
            >
              <template #prefix><DollarOutlined /></template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 搜索和筛选区域 -->
      <a-card :bordered="false" class="content-card">
        <div class="table-page-search-wrapper">
          <a-form layout="inline">
            <a-row :gutter="48">
              <a-col :md="8" :sm="24">
                <a-form-item label="用户搜索">
                  <a-input v-model:value="queryParam.keyword" placeholder="用户名称/账号" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="用户层级">
                  <a-select v-model:value="queryParam.level" placeholder="请选择" style="width: 100%">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="1">一级</a-select-option>
                    <a-select-option value="2">二级</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="注册时间">
                  <a-range-picker v-model:value="queryParam.dateRange" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="账号状态">
                  <a-select v-model:value="queryParam.status" placeholder="请选择" style="width: 100%">
                    <a-select-option value="">全部</a-select-option>
                    <a-select-option value="active">正常</a-select-option>
                    <a-select-option value="disabled">已禁用</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="16" :sm="24">
                <span class="table-page-search-submitButtons">
                  <a-button type="primary" @click="handleSearch">查询</a-button>
                  <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        
        <!-- 下级用户列表（树形结构） -->
        <a-table
          :columns="columns"
          :data-source="referralList"
          :pagination="pagination"
          :loading="tableLoading"
          :row-key="record => record.id"
          :expandable="{ expandedRowKeys: expandedRowKeys, onExpand }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'level'">
              <a-tag :color="record.level === 1 ? 'blue' : 'purple'">
                {{ record.level === 1 ? '一级' : '二级' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                {{ record.status === 'active' ? '正常' : '已禁用' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'secondLevelCount'">
              <a 
                v-if="record.level === 1 && record.secondLevelCount > 0" 
                @click="loadSecondLevelUsers(record)"
              >
                {{ record.secondLevelCount }}
              </a>
              <span v-else>-</span>
            </template>
            <template v-if="column.key === 'action'">
              <a @click="viewMerchantDetail(record)">查看详情</a>
            </template>
          </template>
        </a-table>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { DownloadOutlined, TeamOutlined, ClusterOutlined, DollarOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const merchantId = ref(route.params.id);
const merchantName = ref('');
const loading = ref(true);
const tableLoading = ref(false);
const expandedRowKeys = ref([]);

// 搜索参数
const queryParam = reactive({
  keyword: '',
  level: '',
  status: '',
  dateRange: [],
  pageSize: 10,
  current: 1
});

// 表格分页设置
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
});

// 表格列配置
const columns = [
  {
    title: '用户名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '账号',
    dataIndex: 'email',
    key: 'email',
    ellipsis: true
  },
  {
    title: '层级',
    dataIndex: 'level',
    key: 'level',
    width: 80,
    filters: [
      { text: '一级', value: 1 },
      { text: '二级', value: 2 }
    ],
    filterMultiple: false
  },
  {
    title: '加入时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180
  },
  {
    title: '贡献佣金($)',
    dataIndex: 'commission',
    key: 'commission',
    width: 120,
    sorter: (a, b) => a.commission - b.commission
  },
  {
    title: '本月贡献佣金($)',
    dataIndex: 'monthlyCommission',
    key: 'monthlyCommission',
    width: 160
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    filters: [
      { text: '正常', value: 'active' },
      { text: '已禁用', value: 'disabled' }
    ],
    filterMultiple: false
  },
  {
    title: '二级用户数',
    dataIndex: 'secondLevelCount',
    key: 'secondLevelCount',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right'
  }
];

// 下级用户列表
const referralList = ref([]);

// 下级用户统计
const referralStats = reactive({
  level1Count: 0,
  level2Count: 0,
  level1Commission: 0,
  level2Commission: 0
});

// 二级用户映射，key是一级用户ID，value是其二级用户列表
const secondLevelUsersMap = reactive({});

// 加载商家基本信息
const loadMerchantInfo = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据
    merchantName.value = '环球电子科技';
    
  } catch (error) {
    console.error('Failed to load merchant info:', error);
    message.error('加载商家信息失败');
  } finally {
    loading.value = false;
  }
};

// 加载下级用户列表
const loadReferralList = async () => {
  tableLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟数据 - 一级用户
    const firstLevelUsers = [
      {
        id: 101,
        name: '数字极客',
        email: 'digital.geek@example.com',
        level: 1,
        createdAt: '2023-04-15 14:28:36',
        commission: 350.25,
        monthlyCommission: 45.60,
        status: 'active',
        secondLevelCount: 2,
        parent: null
      },
      {
        id: 102,
        name: '智能家居',
        email: 'smart.home@example.com',
        level: 1,
        createdAt: '2023-04-20 09:42:18',
        commission: 285.60,
        monthlyCommission: 32.75,
        status: 'active',
        secondLevelCount: 1,
        parent: null
      },
      {
        id: 103,
        name: '电子玩家',
        email: 'e.player@example.com',
        level: 1,
        createdAt: '2023-05-10 16:35:22',
        commission: 210.40,
        monthlyCommission: 38.90,
        status: 'disabled',
        secondLevelCount: 0,
        parent: null
      },
      {
        id: 104,
        name: '办公设备',
        email: 'office.equip@example.com',
        level: 1,
        createdAt: '2023-05-18 11:22:45',
        commission: 180.75,
        monthlyCommission: 42.15,
        status: 'active',
        secondLevelCount: 1,
        parent: null
      }
    ];
    
    referralList.value = firstLevelUsers;
    pagination.total = firstLevelUsers.length;
    
    // 更新统计数据
    updateReferralStats();
    
  } catch (error) {
    console.error('Failed to load referral list:', error);
    message.error('加载下级用户列表失败');
  } finally {
    tableLoading.value = false;
  }
};

// 加载二级用户
const loadSecondLevelUsers = async (record) => {
  const parentId = record.id;
  
  // 如果已经加载过，直接展开/收起
  if (expandedRowKeys.value.includes(parentId)) {
    expandedRowKeys.value = expandedRowKeys.value.filter(key => key !== parentId);
    return;
  }
  
  // 如果已经有缓存数据，直接使用
  if (secondLevelUsersMap[parentId]) {
    expandedRowKeys.value = [parentId];
    return;
  }
  
  tableLoading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟二级用户数据
    let secondLevelUsers = [];
    
    // 根据不同的一级用户ID生成不同的二级用户
    if (parentId === 101) {
      secondLevelUsers = [
        {
          id: 201,
          name: '未来电器',
          email: 'future.appliance@example.com',
          level: 2,
          createdAt: '2023-05-05 16:35:52',
          commission: 65.30,
          monthlyCommission: 12.40,
          status: 'active',
          secondLevelCount: 0,
          parent: parentId
        },
        {
          id: 202,
          name: '游戏爱好者',
          email: 'game.lover@example.com',
          level: 2,
          createdAt: '2023-05-12 10:28:14',
          commission: 42.55,
          monthlyCommission: 8.75,
          status: 'active',
          secondLevelCount: 0,
          parent: parentId
        }
      ];
    } else if (parentId === 102) {
      secondLevelUsers = [
        {
          id: 203,
          name: '生活便利店',
          email: 'life.convenience@example.com',
          level: 2,
          createdAt: '2023-05-25 14:42:38',
          commission: 38.20,
          monthlyCommission: 15.30,
          status: 'active',
          secondLevelCount: 0,
          parent: parentId
        }
      ];
    } else if (parentId === 104) {
      secondLevelUsers = [
        {
          id: 204,
          name: '效率专家',
          email: 'efficiency.expert@example.com',
          level: 2,
          createdAt: '2023-06-02 09:15:27',
          commission: 25.10,
          monthlyCommission: 25.10,
          status: 'active',
          secondLevelCount: 0,
          parent: parentId
        }
      ];
    }
    
    // 存储二级用户数据
    secondLevelUsersMap[parentId] = secondLevelUsers;
    
    // 展开当前行
    expandedRowKeys.value = [parentId];
    
  } catch (error) {
    console.error('Failed to load second level users:', error);
    message.error('加载二级用户失败');
  } finally {
    tableLoading.value = false;
  }
};

// 处理展开/收起
const onExpand = (expanded, record) => {
  if (expanded) {
    if (record.level === 1 && record.secondLevelCount > 0) {
      loadSecondLevelUsers(record);
    }
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(key => key !== record.id);
  }
};

// 更新下级用户统计
const updateReferralStats = () => {
  // 计算一级用户统计
  let level1Count = referralList.value.filter(item => item.level === 1).length;
  let level1Commission = referralList.value
    .filter(item => item.level === 1)
    .reduce((sum, item) => sum + item.commission, 0);
  
  // 计算二级用户统计
  let level2Count = 0;
  let level2Commission = 0;
  
  // 累加所有一级用户的二级用户数量
  level2Count = referralList.value
    .filter(item => item.level === 1)
    .reduce((sum, item) => sum + item.secondLevelCount, 0);
  
  // 累加所有二级用户的佣金（如果已加载）
  Object.values(secondLevelUsersMap).forEach(users => {
    users.forEach(user => {
      level2Commission += user.commission;
    });
  });
  
  referralStats.level1Count = level1Count;
  referralStats.level2Count = level2Count;
  referralStats.level1Commission = level1Commission;
  referralStats.level2Commission = level2Commission;
};

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  
  if (filters.level && filters.level.length) {
    queryParam.level = filters.level[0].toString();
  }
  
  if (filters.status && filters.status.length) {
    queryParam.status = filters.status[0];
  }
  
  loadReferralList();
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  loadReferralList();
};

// 重置搜索
const resetSearch = () => {
  Object.assign(queryParam, {
    keyword: '',
    level: '',
    status: '',
    dateRange: [],
    current: 1
  });
  pagination.current = 1;
  loadReferralList();
};

// 查看商家详情
const viewMerchantDetail = (record) => {
  router.push({ path: `/admin/merchants/${record.id}` });
};

// 导出数据
const exportData = () => {
  message.success('下级用户数据导出成功');
};

// 页面加载时获取数据
onMounted(() => {
  Promise.all([
    loadMerchantInfo(),
    loadReferralList()
  ]);
});
</script>

<style lang="less" scoped>
.merchant-referrals-container {
  padding: 24px;
  background: #f0f2f5;
  
  .breadcrumb {
    margin-bottom: 16px;
  }
  
  .page-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-header-content {
      .title {
        margin-bottom: 0;
        font-size: 20px;
      }
    }
  }
  
  .stat-card {
    margin-bottom: 16px;
    
    .primary-stat {
      color: #1890ff;
    }
  }
  
  .content-card {
    margin-bottom: 24px;
  }
  
  .table-page-search-wrapper {
    margin-bottom: 24px;
    
    .table-page-search-submitButtons {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  }
}
</style> 