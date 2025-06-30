<template>
  <div class="order-detail-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/admin/orders/store' }">店铺订单</el-breadcrumb-item>
        <el-breadcrumb-item>订单详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="orderInfo" class="order-content">
      <!-- 订单状态和时间轴 -->
      <div class="order-status-section">
        <el-card>
          <template #header>
            <div class="status-header">
              <h3>订单状态</h3>
              <el-tag :type="getStatusType(orderInfo.status)" size="large">
                {{ getStatusText(orderInfo.status) }}
              </el-tag>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in orderInfo.timeline"
              :key="index"
              :timestamp="formatDateTime(item.time)"
              :type="item.type"
              placement="top"
            >
              <div class="timeline-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>

      <!-- 订单基本信息 -->
      <div class="order-basic-info">
        <el-card>
          <template #header>
            <h3>订单基本信息</h3>
          </template>
          
          <el-descriptions border :column="3">
            <el-descriptions-item label="订单号">
              {{ orderInfo.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              {{ formatDateTime(orderInfo.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(orderInfo.status)">
                {{ getStatusText(orderInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单客户">
              {{ orderInfo.customerName }}
            </el-descriptions-item>
            <el-descriptions-item label="客户邮箱">
              {{ orderInfo.customerEmail }}
            </el-descriptions-item>
            <el-descriptions-item label="商家名称">
              {{ orderInfo.merchantName }}
            </el-descriptions-item>
            <el-descriptions-item label="订单来源店铺">
              {{ orderInfo.storeName }}
            </el-descriptions-item>
            <el-descriptions-item label="订单总金额">
              <span class="total-amount">${{ orderInfo.amounts.totalAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="getSettlementStatusType(orderInfo.settlementStatus)">
                {{ getSettlementStatusText(orderInfo.settlementStatus) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 商家结算信息 -->
      <div class="settlement-info">
        <el-card>
          <template #header>
            <h3>商家结算信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="商家成本">
              ${{ orderInfo.settlement.merchantCost.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="平台服务费">
              ${{ orderInfo.settlement.platformFee.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="商家结算金额">
              ${{ orderInfo.settlement.merchantAmount.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="getSettlementStatusType(orderInfo.settlementStatus)">
                {{ getSettlementStatusText(orderInfo.settlementStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结算时间">
              {{ orderInfo.settlementTime ? formatDateTime(orderInfo.settlementTime) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 订单金额信息 -->
      <div class="order-amount-info">
        <el-card>
          <template #header>
            <h3>订单金额信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="商品金额">
              <span class="amount-text">${{ orderInfo.amounts.productAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="运费金额">
              <span class="amount-text">${{ orderInfo.amounts.shippingAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="折扣金额" v-if="orderInfo.amounts.discountAmount">
              <span class="discount-text">-${{ orderInfo.amounts.discountAmount.toFixed(2) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="订单总金额">
              <span class="total-amount">${{ orderInfo.amounts.totalAmount.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 商品信息 -->
      <div class="order-products-info">
        <el-card>
          <template #header>
            <h3>商品信息</h3>
          </template>
          
          <el-table :data="orderInfo.products" border>
            <el-table-column label="商品" width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image
                    :src="row.image"
                    fit="cover"
                    class="product-image"
                  />
                  <div class="product-details">
                    <div class="product-name">{{ row.name }}</div>
                    <div class="product-specs" v-if="row.specs">
                      <span v-for="(spec, index) in row.specs" :key="index" class="spec-item">
                        {{ spec.name }}: {{ spec.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120">
              <template #default="{ row }">
                ${{ row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100">
              <template #default="{ row }">
                {{ row.quantity }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                <span class="subtotal">${{ (row.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 收货地址信息 -->
      <div class="shipping-address-info">
        <el-card>
          <template #header>
            <h3>收货地址信息</h3>
          </template>
          
          <el-descriptions border :column="2">
            <el-descriptions-item label="收件人">
              {{ orderInfo.shippingAddress.name }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ orderInfo.shippingAddress.phone }}
            </el-descriptions-item>
            <el-descriptions-item label="详细地址" :span="2">
              {{ orderInfo.shippingAddress.fullAddress }}
            </el-descriptions-item>
            <el-descriptions-item label="邮编">
              {{ orderInfo.shippingAddress.zipCode }}
            </el-descriptions-item>
            <el-descriptions-item label="国家/地区">
              {{ orderInfo.shippingAddress.country }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- 物流信息 -->
      <div v-if="orderInfo.logistics" class="logistics-info">
        <el-card>
          <template #header>
            <div class="logistics-header">
              <h3>物流信息</h3>
              <el-button size="small" @click="refreshLogistics">
                <el-icon><Refresh /></el-icon>
                刷新轨迹
              </el-button>
            </div>
          </template>
          
          <div class="logistics-basic">
            <el-descriptions border :column="2">
              <el-descriptions-item label="物流单号">
                {{ orderInfo.logistics.trackingNumber }}
                <el-button size="small" type="primary" link @click="copyTrackingNumber">
                  复制
                </el-button>
              </el-descriptions-item>
              <el-descriptions-item label="物流公司">
                {{ orderInfo.logistics.company }}
              </el-descriptions-item>
              <el-descriptions-item label="发货时间">
                {{ formatDateTime(orderInfo.logistics.shippedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="物流状态">
                <el-tag :type="getLogisticsStatusType(orderInfo.logistics.status)">
                  {{ orderInfo.logistics.status }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="logistics-timeline">
            <h4>物流轨迹</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in orderInfo.logistics.timeline"
                :key="index"
                :timestamp="formatDateTime(item.time)"
                placement="top"
              >
                <div class="logistics-timeline-content">
                  <div class="status">{{ item.status }}</div>
                  <div class="location">{{ item.location }}</div>
                  <div class="description">{{ item.description }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>

      <!-- 备注信息 -->
      <div v-if="orderInfo.remark" class="order-remark">
        <el-card>
          <template #header>
            <h3>备注信息</h3>
          </template>
          <p>{{ orderInfo.remark }}</p>
        </el-card>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const orderInfo = ref(null)

// 生命周期
onMounted(() => {
  loadOrderDetail()
})

// 方法
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const orderId = route.params.id
    
    // 模拟加载订单详情
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟订单数据
    orderInfo.value = {
      id: orderId,
      orderNo: 'ORD202312150001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      merchantName: '优选商家001',
      storeName: '店铺A',
      status: 'shipped',
      settlementStatus: 'settled',
      createdAt: '2023-12-15 10:30:00',
      settlementTime: '2023-12-15 11:00:00',
      timeline: [
        {
          time: '2023-12-15 10:30:00',
          title: '订单创建',
          description: '客户成功下单，订单进入待发货状态',
          type: 'primary'
        },
        {
          time: '2023-12-15 11:00:00',
          title: '费用扣除',
          description: '从商家账户余额扣除订单费用',
          type: 'success'
        },
        {
          time: '2023-12-15 14:30:00',
          title: '订单发货',
          description: '订单已发货，物流单号：SF1234567890',
          type: 'warning'
        },
        {
          time: '2023-12-15 18:45:00',
          title: '订单完成',
          description: '订单已送达，交易完成',
          type: 'success'
        }
      ],
      settlement: {
        merchantCost: 45.50,
        platformFee: 4.50,
        merchantAmount: 41.00
      },
      amounts: {
        productAmount: 89.99,
        shippingAmount: 10.00,
        discountAmount: 5.00,
        totalAmount: 94.99
      },
      products: [
        {
          id: 1,
          name: '无线蓝牙耳机 - 高音质立体声',
          image: 'https://via.placeholder.com/100x100?text=Product1',
          price: 89.99,
          quantity: 1,
          specs: [
            { name: '颜色', value: '黑色' },
            { name: '型号', value: 'WH-1000XM4' }
          ]
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        phone: '+1-555-0123',
        fullAddress: '123 Main Street, Apartment 4B, New York, NY 10001',
        zipCode: '10001',
        country: '美国'
      },
      logistics: {
        trackingNumber: 'SF1234567890',
        company: '顺丰速运',
        status: '已签收',
        shippedAt: '2023-12-15 14:30:00',
        timeline: [
          {
            time: '2023-12-15 14:30:00',
            status: '已发货',
            location: '深圳市',
            description: '您的快件已从深圳分拣中心发出'
          },
          {
            time: '2023-12-16 08:15:00',
            status: '运输中',
            location: '广州市',
            description: '快件到达广州中转站'
          },
          {
            time: '2023-12-16 18:45:00',
            status: '已签收',
            location: '纽约市',
            description: '快件已签收，签收人：本人'
          }
        ]
      },
      remark: '客户要求加急处理，已优先发货'
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const refreshLogistics = async () => {
  ElMessage.info('正在刷新物流信息...')
  // 模拟刷新
  setTimeout(() => {
    ElMessage.success('物流信息已更新')
  }, 1000)
}

const copyTrackingNumber = () => {
  if (orderInfo.value?.logistics?.trackingNumber) {
    navigator.clipboard.writeText(orderInfo.value.logistics.trackingNumber)
    ElMessage.success('物流单号已复制到剪贴板')
  }
}

// 状态相关方法
const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'processing': 'primary',
    'shipped': 'success',
    'delivered': 'success',
    'cancelled': 'danger',
    'refunded': 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待发货',
    'processing': '处理中',
    'shipped': '已发货',
    'delivered': '已送达',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

const getSettlementStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'settled': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

const getSettlementStatusText = (status) => {
  const statusMap = {
    'pending': '待结算',
    'settled': '已结算',
    'failed': '结算失败'
  }
  return statusMap[status] || status
}

const getLogisticsStatusType = (status) => {
  const statusMap = {
    '已发货': 'primary',
    '运输中': 'warning',
    '已签收': 'success',
    '异常': 'danger'
  }
  return statusMap[status] || 'info'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
@import "@/assets/styles/global.scss";

.order-detail-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .breadcrumb-section {
    margin-bottom: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .loading-wrapper {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .order-content {
    .order-status-section,
    .order-basic-info,
    .settlement-info,
    .order-amount-info,
    .order-products-info,
    .shipping-address-info,
    .logistics-info,
    .order-remark {
      margin-bottom: 20px;

      .el-card {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #333;
      }
    }

    .timeline-content {
      h4 {
        margin: 0 0 5px 0;
        color: #333;
        font-size: 14px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 12px;
      }
    }

    .amount-text {
      color: #409eff;
      font-weight: 500;
    }

    .discount-text {
      color: #f56c6c;
      font-weight: 500;
    }

    .total-amount {
      color: #e6a23c;
      font-weight: bold;
      font-size: 16px;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .product-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
      }

      .product-details {
        flex: 1;

        .product-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }

        .product-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .spec-item {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .subtotal {
      font-weight: 500;
      color: #333;
    }

    .logistics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #333;
      }
    }

    .logistics-timeline {
      margin-top: 20px;

      h4 {
        margin-bottom: 15px;
        color: #333;
      }

      .logistics-timeline-content {
        .status {
          font-weight: 500;
          color: #333;
          margin-bottom: 3px;
        }

        .location {
          color: #666;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .description {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .action-buttons {
      margin-top: 30px;
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .el-button {
        margin: 0 10px;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: 10px;

    .order-content {
      .el-descriptions {
        :deep(.el-descriptions__table) {
          .el-descriptions__cell {
            padding: 8px;
          }
        }
      }

      .product-info {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;

        .product-image {
          width: 80px;
          height: 80px;
        }
      }

      .action-buttons {
        .el-button {
          margin: 5px;
          width: calc(50% - 10px);
        }
      }
    }
  }
}
</style> 