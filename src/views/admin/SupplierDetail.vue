<template>
  <div class="supplier-detail-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb class="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/admin/suppliers' }">供应商管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ supplierInfo.name || '供应商详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 供应商详情内容 -->
    <div v-else class="detail-container">
      <!-- 状态大标签 -->
      <div class="status-header">
        <el-tag
          :type="getStatusTagType(supplierInfo.status)"
          size="large"
          effect="light"
          class="status-tag"
        >
          {{ getStatusText(supplierInfo.status) }}
        </el-tag>
        <div class="header-actions">
                  <el-button type="warning" @click="handleEdit" :icon="Edit">编辑供应商</el-button>
        <el-button type="danger" @click="handleDelete" :icon="Delete">删除供应商</el-button>
          <el-button 
            v-if="supplierInfo.status === 'pending'" 
            type="success" 
            @click="handleAudit"
            :icon="Check"
          >
            审核供应商
          </el-button>
          <el-button type="info" @click="handleBack" :icon="ArrowLeft">返回列表</el-button>
        </div>
      </div>

      <!-- 基本信息卡片 -->
      <el-card class="info-card" header="基本信息" shadow="never">
        <div class="info-grid">
          <div class="info-item">
            <label>供应商名称：</label>
            <span class="value-text">{{ supplierInfo.name }}</span>
          </div>
          <div class="info-item">
            <label>供应商编号：</label>
            <span class="value-text">{{ supplierInfo.code }}</span>
          </div>
          <div class="info-item">
            <label>联系人：</label>
            <span class="value-text">{{ supplierInfo.contactPerson }}</span>
          </div>
          <div class="info-item">
            <label>供应商类型：</label>
            <el-tag size="small">{{ getTypeText(supplierInfo.type) }}</el-tag>
          </div>
          <div class="info-item">
            <label>创建时间：</label>
            <span class="value-text">{{ formatDate(supplierInfo.createdAt) }}</span>
          </div>
          <div class="info-item">
            <label>状态：</label>
            <el-tag :type="getStatusTagType(supplierInfo.status)" size="small">
              {{ getStatusText(supplierInfo.status) }}
            </el-tag>
          </div>
        </div>

        <!-- 审核信息 -->
        <div v-if="supplierInfo.auditInfo" class="audit-info">
          <h4>审核信息</h4>
          <div class="audit-grid">
            <div class="audit-item">
              <label>审核人：</label>
              <span>{{ supplierInfo.auditInfo.auditor }}</span>
            </div>
            <div class="audit-item">
              <label>审核时间：</label>
              <span>{{ formatDate(supplierInfo.auditInfo.auditTime) }}</span>
            </div>
            <div class="audit-item">
              <label>审核结果：</label>
              <el-tag :type="getStatusTagType(supplierInfo.auditInfo.result)" size="small">
                {{ getStatusText(supplierInfo.auditInfo.result) }}
              </el-tag>
            </div>
            <div v-if="supplierInfo.auditInfo.remark" class="audit-item full-width">
              <label>审核备注：</label>
              <span>{{ supplierInfo.auditInfo.remark }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 联系信息卡片 -->
      <el-card class="info-card" header="联系信息" shadow="never">
        <div class="info-grid">
          <div class="info-item">
            <label>联系电话：</label>
            <span class="value-text">
              {{ supplierInfo.phone }}
              <el-button size="small" text @click="copyToClipboard(supplierInfo.phone)">
                <el-icon><copy-document /></el-icon>
              </el-button>
            </span>
          </div>
          <div class="info-item">
            <label>电子邮箱：</label>
            <span class="value-text">
              {{ supplierInfo.email }}
              <el-button size="small" text @click="copyToClipboard(supplierInfo.email)">
                <el-icon><copy-document /></el-icon>
              </el-button>
            </span>
          </div>
          <div class="info-item">
            <label>传真号码：</label>
            <span class="value-text">{{ supplierInfo.fax || '未填写' }}</span>
          </div>
          <div class="info-item">
            <label>网站地址：</label>
            <span class="value-text">
              <el-button 
                v-if="supplierInfo.website" 
                type="text" 
                @click="openWebsite(supplierInfo.website)"
              >
                {{ supplierInfo.website }}
                <el-icon><link /></el-icon>
              </el-button>
              <span v-else>未填写</span>
            </span>
          </div>
          <div class="info-item full-width">
            <label>公司地址：</label>
            <span class="value-text">{{ supplierInfo.address }}</span>
          </div>
          <div class="info-item">
            <label>国家/地区：</label>
            <span class="value-text">{{ getCountryText(supplierInfo.country) }}</span>
          </div>
          <div class="info-item">
            <label>邮政编码：</label>
            <span class="value-text">{{ supplierInfo.postalCode || '未填写' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 财务信息卡片 -->
      <el-card class="info-card" header="财务信息" shadow="never">
        <div class="info-grid">
          <div class="info-item">
            <label>银行账户名称：</label>
            <span class="value-text">{{ supplierInfo.bankAccountName || '未填写' }}</span>
          </div>
          <div class="info-item">
            <label>银行账号：</label>
            <span class="value-text">
              {{ supplierInfo.bankAccount ? maskBankAccount(supplierInfo.bankAccount) : '未填写' }}
              <el-button 
                v-if="supplierInfo.bankAccount" 
                size="small" 
                text 
                @click="showFullBankAccount = !showFullBankAccount"
              >
                {{ showFullBankAccount ? '隐藏' : '显示' }}
              </el-button>
            </span>
          </div>
          <div class="info-item">
            <label>开户银行：</label>
            <span class="value-text">{{ supplierInfo.bankName || '未填写' }}</span>
          </div>
          <div class="info-item">
            <label>Swift代码：</label>
            <span class="value-text">{{ supplierInfo.swiftCode || '未填写' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 备注信息卡片 -->
      <el-card class="info-card" header="备注信息" shadow="never">
        <div class="remark-content">
          {{ supplierInfo.remark || '无备注信息' }}
        </div>
      </el-card>

      <!-- 认证文件卡片 -->
      <el-card class="info-card" header="认证文件" shadow="never">
        <div class="documents-section">
          <!-- 营业执照 -->
          <div class="document-group">
            <h4>营业执照</h4>
            <div v-if="supplierInfo.businessLicense && supplierInfo.businessLicense.length > 0" class="document-list">
              <div 
                v-for="(file, index) in supplierInfo.businessLicense" 
                :key="index"
                class="document-item"
              >
                <el-image
                  v-if="isImageFile(file.name)"
                  :src="file.url"
                  :preview-src-list="[file.url]"
                  fit="cover"
                  class="document-preview"
                />
                <div v-else class="document-file">
                  <el-icon><document /></el-icon>
                  <span>{{ file.name }}</span>
                </div>
                <div class="document-actions">
                  <el-button size="small" type="success" @click="downloadFile(file)">下载</el-button>
                  <el-button size="small" type="primary" @click="previewFile(file)">预览</el-button>
                </div>
              </div>
            </div>
            <div v-else class="no-documents">
              <el-empty description="暂无营业执照" :image-size="80" />
            </div>
          </div>

          <!-- 其他资质文件 -->
          <div class="document-group">
            <h4>其他资质文件</h4>
            <div v-if="supplierInfo.qualificationFiles && supplierInfo.qualificationFiles.length > 0" class="document-list">
              <div 
                v-for="(file, index) in supplierInfo.qualificationFiles" 
                :key="index"
                class="document-item"
              >
                <el-image
                  v-if="isImageFile(file.name)"
                  :src="file.url"
                  :preview-src-list="[file.url]"
                  fit="cover"
                  class="document-preview"
                />
                <div v-else class="document-file">
                  <el-icon><document /></el-icon>
                  <span>{{ file.name }}</span>
                </div>
                <div class="document-actions">
                  <el-button size="small" type="success" @click="downloadFile(file)">下载</el-button>
                  <el-button size="small" type="primary" @click="previewFile(file)">预览</el-button>
                </div>
              </div>
            </div>
            <div v-else class="no-documents">
              <el-empty description="暂无其他资质文件" :image-size="80" />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 供应商商品列表卡片 -->
      <el-card class="info-card" header="供应商商品" shadow="never">
        <div class="products-section">
          <!-- 搜索框 -->
          <div class="products-header">
            <el-input
              v-model="productSearchKeyword"
              placeholder="搜索商品名称"
              style="width: 300px"
              clearable
              @input="handleProductSearch"
            >
              <template #prefix>
                <el-icon><search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAddProduct">添加商品</el-button>
          </div>

          <!-- 商品列表 -->
          <el-table
            :data="productList"
            v-loading="productsLoading"
            style="margin-top: 16px"
          >
            <el-table-column prop="name" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="code" label="商品编号" width="120" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                ${{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '上架' : '下架' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" type="info" @click="handleViewProduct(row)">查看</el-button>
                <el-button size="small" type="warning" @click="handleEditProduct(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="products-pagination">
            <el-pagination
              v-model:current-page="productPagination.currentPage"
              v-model:page-size="productPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="productPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleProductSizeChange"
              @current-change="handleProductCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 供应商审核弹窗 -->
    <SupplierAuditModal
      v-model:visible="auditModalVisible"
      :supplier="supplierInfo"
      @confirm="handleAuditConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  Check,
  ArrowLeft,
  CopyDocument,
  Link,
  Document,
  Search
} from '@element-plus/icons-vue'
import SupplierAuditModal from '@/components/admin/SupplierAuditModal.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(true)
const productsLoading = ref(false)
const auditModalVisible = ref(false)
const showFullBankAccount = ref(false)
const productSearchKeyword = ref('')

// 供应商信息
const supplierInfo = ref({
  id: null,
  code: '',
  name: '',
  contactPerson: '',
  type: '',
  phone: '',
  email: '',
  fax: '',
  website: '',
  address: '',
  country: '',
  postalCode: '',
  bankAccountName: '',
  bankAccount: '',
  bankName: '',
  swiftCode: '',
  businessLicense: [],
  qualificationFiles: [],
  remark: '',
  status: '',
  createdAt: '',
  auditInfo: null
})

// 商品列表数据
const productList = ref([])
const productPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 页面初始化
onMounted(() => {
  loadSupplierDetail()
  loadSupplierProducts()
})

// 方法定义
const loadSupplierDetail = async () => {
  try {
    loading.value = true
    const supplierId = route.params.id
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    supplierInfo.value = {
      id: supplierId,
      code: 'SUP001',
      name: '阿里巴巴供应链有限公司',
      contactPerson: '张三',
      type: 'domestic',
      phone: '13800138000',
      email: 'zhang@alibaba.com',
      fax: '0571-88888888',
      website: 'https://www.alibaba.com',
      address: '浙江省杭州市西湖区文三路969号华星世纪大楼',
      country: 'CN',
      postalCode: '310012',
      bankAccountName: '阿里巴巴供应链有限公司',
      bankAccount: '6222021234567890123',
      bankName: '中国工商银行杭州文三支行',
      swiftCode: 'ICBKCNBJ',
      businessLicense: [
        { name: '营业执照.jpg', url: '/mock/business-license.jpg' }
      ],
      qualificationFiles: [
        { name: '生产许可证.pdf', url: '/mock/production-license.pdf' },
        { name: '质量认证.jpg', url: '/mock/quality-cert.jpg' }
      ],
      remark: '主要供应电子产品，合作关系良好，按时交货，质量稳定',
      status: 'approved',
      createdAt: '2024-01-15 10:30:00',
      auditInfo: {
        auditor: '管理员王五',
        auditTime: '2024-01-16 09:15:00',
        result: 'approved',
        remark: '资质齐全，审核通过'
      }
    }
  } catch (error) {
    ElMessage.error('加载供应商详情失败')
  } finally {
    loading.value = false
  }
}

const loadSupplierProducts = async () => {
  try {
    productsLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟商品数据
    productList.value = [
      {
        id: 1,
        code: 'PRD001',
        name: '苹果iPhone 15 Pro Max',
        category: '手机',
        image: '/mock/iphone.jpg',
        price: 899,
        stock: 50,
        status: 'active'
      },
      {
        id: 2,
        code: 'PRD002',
        name: '华为Mate 60 Pro',
        category: '手机',
        image: '/mock/huawei.jpg',
        price: 699,
        stock: 30,
        status: 'active'
      }
    ]
    
    productPagination.total = 25 // 模拟总数
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    productsLoading.value = false
  }
}

const handleEdit = () => {
  router.push(`/admin/suppliers/edit/${supplierInfo.value.id}`)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除供应商"${supplierInfo.value.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用删除API
    ElMessage.success('删除成功')
    router.push('/admin/suppliers')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleAudit = () => {
  auditModalVisible.value = true
}

const handleAuditConfirm = async (auditData) => {
  try {
    // 调用审核API
    ElMessage.success('审核完成')
    auditModalVisible.value = false
    await loadSupplierDetail() // 重新加载数据
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

const handleBack = () => {
  router.push('/admin/suppliers')
}

const handleProductSearch = () => {
  productPagination.currentPage = 1
  loadSupplierProducts()
}

const handleAddProduct = () => {
  router.push(`/admin/products/create?supplierId=${supplierInfo.value.id}`)
}

const handleViewProduct = (product) => {
  router.push(`/admin/products/${product.id}`)
}

const handleEditProduct = (product) => {
  router.push(`/admin/products/edit/${product.id}`)
}

const handleProductSizeChange = (newSize) => {
  productPagination.pageSize = newSize
  loadSupplierProducts()
}

const handleProductCurrentChange = (newPage) => {
  productPagination.currentPage = newPage
  loadSupplierProducts()
}

// 辅助方法
const getStatusTagType = (status) => {
  const typeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    approved: '审核通过',
    rejected: '审核不通过',
    pending: '待审核'
  }
  return textMap[status] || '未知'
}

const getTypeText = (type) => {
  const textMap = {
    domestic: '国内供应商',
    overseas: '海外供应商',
    brand: '品牌方',
    agent: '代理商'
  }
  return textMap[type] || '未知'
}

const getCountryText = (country) => {
  const countryMap = {
    CN: '中国',
    US: '美国',
    UK: '英国',
    DE: '德国',
    JP: '日本',
    KR: '韩国'
  }
  return countryMap[country] || country
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const maskBankAccount = (account) => {
  if (!account || showFullBankAccount.value) return account
  return account.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const openWebsite = (url) => {
  window.open(url, '_blank')
}

const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

const downloadFile = (file) => {
  // 模拟文件下载
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.click()
  ElMessage.success('开始下载文件')
}

const previewFile = (file) => {
  // 模拟文件预览
  window.open(file.url, '_blank')
}
</script>

<style scoped lang="scss">
.supplier-detail-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
  }

  .loading-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
  }

  .detail-container {
    max-width: 1200px;
    margin: 0 auto;

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .status-tag {
        font-size: 16px;
        padding: 8px 16px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .info-card {
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;

      :deep(.el-card__header) {
        background: #f8f9fa;
        font-weight: 600;
        color: #303133;
        padding: 16px 20px;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;

      .info-item {
        display: flex;
        align-items: center;

        label {
          font-weight: 500;
          color: #606266;
          min-width: 120px;
          margin-right: 12px;
        }

        .value-text {
          color: #303133;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        &.full-width {
          grid-column: 1 / -1;
          align-items: flex-start;

          label {
            margin-top: 2px;
          }
        }
      }
    }

    .audit-info {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #ebeef5;

      h4 {
        margin: 0 0 16px 0;
        color: #303133;
      }

      .audit-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;

        .audit-item {
          display: flex;
          align-items: center;

          label {
            font-weight: 500;
            color: #606266;
            min-width: 80px;
            margin-right: 12px;
          }

          &.full-width {
            grid-column: 1 / -1;
            align-items: flex-start;

            label {
              margin-top: 2px;
            }
          }
        }
      }
    }

    .remark-content {
      color: #303133;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .documents-section {
      .document-group {
        margin-bottom: 32px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 16px 0;
          color: #303133;
          font-size: 16px;
        }

        .document-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;

          .document-item {
            border: 1px solid #ebeef5;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s;

            &:hover {
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .document-preview {
              width: 100%;
              height: 120px;
            }

            .document-file {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 120px;
              background: #f8f9fa;

              .el-icon {
                font-size: 32px;
                color: #909399;
                margin-bottom: 8px;
              }

              span {
                font-size: 12px;
                color: #606266;
                text-align: center;
                padding: 0 8px;
                word-break: break-all;
              }
            }

            .document-actions {
              padding: 8px;
              display: flex;
              justify-content: center;
              gap: 8px;
            }
          }
        }

        .no-documents {
          text-align: center;
          padding: 40px;
          color: #909399;
        }
      }
    }

    .products-section {
      .products-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .products-pagination {
        display: flex;
        justify-content: center;
        margin-top: 20px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .supplier-detail-page {
    padding: 10px;

    .detail-container {
      .status-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .header-actions {
          flex-wrap: wrap;
          justify-content: center;
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .documents-section {
        .document-list {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
      }

      .products-section {
        .products-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }
      }
    }
  }
}
</style> 