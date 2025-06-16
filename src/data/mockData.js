// 商品管理模块初始数据

// 商品分类数据
export const categories = [
  {
    id: 1,
    name: '电子产品',
    icon: 'mobile',
    productCount: 125,
    sortOrder: 1,
    isVisible: true,
    description: '手机、电脑、数码产品等',
    children: [
      { id: 11, name: '手机配件', productCount: 45, sortOrder: 1 },
      { id: 12, name: '数码相机', productCount: 32, sortOrder: 2 },
      { id: 13, name: '电脑周边', productCount: 28, sortOrder: 3 },
      { id: 14, name: '智能穿戴', productCount: 20, sortOrder: 4 }
    ]
  },
  {
    id: 2,
    name: '服装配饰',
    icon: 'shopping',
    productCount: 89,
    sortOrder: 2,
    isVisible: true,
    description: '服装、鞋靴、配饰等',
    children: [
      { id: 21, name: '男装', productCount: 35, sortOrder: 1 },
      { id: 22, name: '女装', productCount: 42, sortOrder: 2 },
      { id: 23, name: '鞋靴', productCount: 12, sortOrder: 3 }
    ]
  },
  {
    id: 3,
    name: '家居用品',
    icon: 'home',
    productCount: 67,
    sortOrder: 3,
    isVisible: true,
    description: '家具、装饰、生活用品等'
  },
  {
    id: 4,
    name: '运动户外',
    icon: 'trophy',
    productCount: 54,
    sortOrder: 4,
    isVisible: true,
    description: '运动装备、户外用品等'
  },
  {
    id: 5,
    name: '美妆护肤',
    icon: 'heart',
    productCount: 78,
    sortOrder: 5,
    isVisible: true,
    description: '化妆品、护肤品、个护用品等'
  },
  {
    id: 6,
    name: '汽车用品',
    icon: 'car',
    productCount: 23,
    sortOrder: 6,
    isVisible: true,
    description: '汽车配件、装饰用品等'
  },
  {
    id: 7,
    name: '母婴用品',
    icon: 'baby-carriage',
    productCount: 45,
    sortOrder: 7,
    isVisible: true,
    description: '婴幼儿用品、玩具等'
  },
  {
    id: 8,
    name: '食品饮料',
    icon: 'coffee',
    productCount: 31,
    sortOrder: 8,
    isVisible: true,
    description: '食品、饮料、保健品等'
  }
]

// 供应商数据
export const suppliers = [
  {
    id: 1,
    name: '深圳优质科技有限公司',
    contactName: '张先生',
    contactPhone: '13800138001',
    contactEmail: 'zhang@supplier1.com',
    address: '深圳市南山区科技园',
    type: '制造商',
    status: 'approved',
    cooperationStartDate: '2023-01-15',
    productCount: 45,
    totalSales: 125000,
    description: '专业生产手机配件、数码产品'
  },
  {
    id: 2,
    name: '广州品质贸易公司',
    contactName: '李女士',
    contactPhone: '13800138002',
    contactEmail: 'li@supplier2.com',
    address: '广州市天河区CBD',
    type: '贸易商',
    status: 'approved',
    cooperationStartDate: '2023-02-20',
    productCount: 32,
    totalSales: 89000,
    description: '服装、配饰类产品供应商'
  },
  {
    id: 3,
    name: '东莞精品制造厂',
    contactName: '王先生',
    contactPhone: '13800138003',
    contactEmail: 'wang@supplier3.com',
    address: '东莞市长安镇工业区',
    type: '制造商',
    status: 'approved',
    cooperationStartDate: '2023-03-10',
    productCount: 28,
    totalSales: 67000,
    description: '家居用品、生活用品制造'
  },
  {
    id: 4,
    name: '佛山创新电子公司',
    contactName: '陈女士',
    contactPhone: '13800138004',
    contactEmail: 'chen@supplier4.com',
    address: '佛山市顺德区科技园',
    type: '制造商',
    status: 'pending',
    cooperationStartDate: '2024-01-01',
    productCount: 0,
    totalSales: 0,
    description: '智能硬件、电子产品'
  },
  {
    id: 5,
    name: '中山专业供应商',
    contactName: '刘先生',
    contactPhone: '13800138005',
    contactEmail: 'liu@supplier5.com',
    address: '中山市火炬开发区',
    type: '贸易商',
    status: 'approved',
    cooperationStartDate: '2023-06-15',
    productCount: 23,
    totalSales: 45000,
    description: '运动用品、户外装备'
  },
  {
    id: 6,
    name: '珠海国际贸易公司',
    contactName: '黄女士',
    contactPhone: '13800138006',
    contactEmail: 'huang@supplier6.com',
    address: '珠海市香洲区',
    type: '贸易商',
    status: 'approved',
    cooperationStartDate: '2023-08-20',
    productCount: 19,
    totalSales: 38000,
    description: '美妆护肤、个护用品'
  }
]

// 运费模板数据
export const shippingTemplates = [
  {
    id: 1,
    name: '标准运费模板',
    type: 'weight',
    baseWeight: 1,
    basePrice: 8.00,
    additionalWeight: 0.5,
    additionalPrice: 2.00,
    freeShippingThreshold: 99.00,
    description: '按重量计费，满99免运费'
  },
  {
    id: 2,
    name: '免费配送模板',
    type: 'free',
    basePrice: 0,
    description: '全场包邮'
  },
  {
    id: 3,
    name: '快递配送模板',
    type: 'express',
    basePrice: 12.00,
    freeShippingThreshold: 199.00,
    description: '快递配送，满199免运费'
  },
  {
    id: 4,
    name: '国际运费模板',
    type: 'international',
    basePrice: 25.00,
    description: '国际配送专用'
  },
  {
    id: 5,
    name: '大件商品模板',
    type: 'volume',
    baseVolume: 0.1,
    basePrice: 15.00,
    additionalVolume: 0.05,
    additionalPrice: 5.00,
    description: '按体积计费，适用于大件商品'
  }
]

// 商品状态选项
export const productStatuses = [
  { label: '全部状态', value: '' },
  { label: '审核中', value: 'pending', color: 'processing' },
  { label: '待发布', value: 'draft', color: 'default' },
  { label: '已上架', value: 'published', color: 'success' },
  { label: '审核不通过', value: 'rejected', color: 'error' }
]

// 常用商品标签
export const commonTags = [
  '热销', '新品', '限时特惠', '包邮', '推荐', '精选', 
  '爆款', '品质保证', '限量版', '畅销', '性价比', '进口'
]

// 生成商品数据的函数
export const generateMockProducts = (count = 50) => {
  const productNames = [
    'iPhone 15 Pro Max 透明保护壳',
    'MacBook Air M2 超薄笔记本电脑',
    'AirPods Pro 第三代无线耳机',
    'iPad Air 10.9英寸平板电脑',
    'Apple Watch Series 9 智能手表',
    'Samsung Galaxy S24 Ultra 手机',
    'Sony WH-1000XM5 降噪耳机',
    'Nike Air Max 270 运动鞋',
    'Adidas Ultraboost 22 跑步鞋',
    'Levi\'s 501 经典牛仔裤',
    'Zara 修身西装外套',
    'Uniqlo Heattech 保暖内衣',
    '戴森V15 Detect无线吸尘器',
    'Philips 飞利浦空气炸锅',
    'Nespresso 胶囊咖啡机',
    'KitchenAid 厨师机',
    'IKEA MALM 六斗抽屉柜',
    'Muji 无印良品棉麻床单套装',
    '兰蔻小黑瓶精华液',
    'SK-II 神仙水爽肤水',
    '雅诗兰黛小棕瓶眼霜',
    'Dior 口红999号色',
    'MAC 魅可粉底液',
    'Lululemon 瑜伽裤',
    'Nike Dri-FIT 运动T恤',
    'Patagonia 冲锋衣',
    'The North Face 羽绒服',
    'Yeti 保温水杯',
    'GoPro Hero 12运动相机',
    'DJI Mini 4 Pro 无人机',
    'Canon EOS R5 专业相机',
    'Sony A7 IV 微单相机',
    'Bose QuietComfort 45 耳机',
    'Marshall Kilburn II 蓝牙音箱',
    '小米13 Pro 智能手机',
    'OnePlus 11 5G手机',
    'Google Pixel 8 Pro',
    'Tesla Model 3 车载充电器',
    'Anker PowerCore 移动电源',
    'RAVPower 65W PD充电器',
    'Belkin MagSafe 无线充电器',
    'Logitech MX Master 3S 鼠标',
    'Keychron K8 机械键盘',
    'Herman Miller Aeron 办公椅',
    'UPLIFT V2 升降桌',
    'Philips Hue 智能灯泡',
    'Nest Learning 恒温器',
    'Ring Video Doorbell 4',
    'Arlo Pro 4 安防摄像头',
    '美的变频空调挂机'
  ]

  const statuses = ['pending', 'draft', 'published', 'rejected']
  const statusWeights = [0.3, 0.2, 0.4, 0.1] // 权重分配
  const tagPool = commonTags

  return Array.from({ length: count }, (_, index) => {
    // 按权重随机选择状态
    const rand = Math.random()
    let status = 'pending'
    let cumulativeWeight = 0
    for (let i = 0; i < statusWeights.length; i++) {
      cumulativeWeight += statusWeights[i]
      if (rand <= cumulativeWeight) {
        status = statuses[i]
        break
      }
    }

    const basePrice = Math.floor(Math.random() * 500) + 50
    const cost = Math.floor(basePrice * (0.4 + Math.random() * 0.3))
    const suggestedPrice = Math.floor(basePrice * (1.2 + Math.random() * 0.5))
    const categoryId = Math.floor(Math.random() * categories.length) + 1
    const supplierId = Math.floor(Math.random() * suppliers.length) + 1
    
    // 随机选择1-3个标签
    const selectedTags = []
    const tagCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < tagCount; i++) {
      const randomTag = tagPool[Math.floor(Math.random() * tagPool.length)]
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag)
      }
    }
    
    return {
      id: index + 1,
      name: productNames[index] || `商品名称${index + 1}`,
      code: `PRD${String(index + 1).padStart(5, '0')}`,
      categoryId,
      categoryName: categories.find(c => c.id === categoryId)?.name || '其他',
      supplierId,
      supplierName: suppliers.find(s => s.id === supplierId)?.name || '未知供应商',
      image: `https://picsum.photos/400/400?random=${index + 1}`,
      images: [
        `https://picsum.photos/400/400?random=${index + 1}`,
        `https://picsum.photos/400/400?random=${index + 101}`,
        `https://picsum.photos/400/400?random=${index + 201}`
      ],
      price: basePrice,
      suggestedPrice,
      cost,
      stock: Math.floor(Math.random() * 1000) + 50,
      status,
      totalSales: status === 'published' ? Math.floor(Math.random() * 500) + 10 : 0,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sku: `SKU${String(index + 1).padStart(5, '0')}`,
      description: '这是一款优质的商品，采用高品质材料制作，为用户提供卓越的使用体验。经过严格的质量检测，确保产品性能稳定可靠。',
      specifications: [
        { name: '品牌', value: '优质品牌' },
        { name: '型号', value: `MODEL-${String(index + 1).padStart(3, '0')}` },
        { name: '颜色', value: ['黑色', '白色', '蓝色', '红色'][Math.floor(Math.random() * 4)] },
        { name: '材质', value: ['塑料', '金属', '玻璃', '硅胶'][Math.floor(Math.random() * 4)] }
      ],
      weight: Number((Math.random() * 2 + 0.1).toFixed(2)),
      volume: Number((Math.random() * 0.5 + 0.01).toFixed(3)),
      shippingTemplateId: Math.floor(Math.random() * shippingTemplates.length) + 1,
      tags: selectedTags,
      isRecommended: Math.random() > 0.7,
      lowStockWarning: 10
    }
  })
}

// 生成审核记录数据
export const generateAuditHistory = (productId, status) => {
  const baseTime = new Date()
  const history = []
  
  // 创建记录
  history.push({
    id: 1,
    productId,
    status: 'pending',
    operator: '商户',
    operatorId: 1,
    remark: '提交商品审核',
    createdAt: new Date(baseTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  })
  
  if (status === 'published' || status === 'rejected') {
    // 审核记录
    history.push({
      id: 2,
      productId,
      status: status === 'published' ? 'approved' : 'rejected',
      operator: '管理员',
      operatorId: 101,
      remark: status === 'published' 
        ? '商品信息完整，质量符合标准，审核通过' 
        : '商品描述不够详细，图片质量不佳，请重新提交',
      createdAt: new Date(baseTime.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    })
    
    if (status === 'published') {
      // 发布记录
      history.push({
        id: 3,
        productId,
        status: 'published',
        operator: '系统',
        operatorId: 0,
        remark: '商品自动上架',
        createdAt: new Date(baseTime.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 1000).toISOString()
      })
    }
  }
  
  return history.reverse() // 最新的在前面
}

// 库存调整记录
export const generateStockHistory = (productId) => {
  const baseTime = new Date()
  return [
    {
      id: 1,
      productId,
      type: 'add',
      amount: 100,
      beforeStock: 50,
      afterStock: 150,
      remark: '初始入库',
      operator: '仓库管理员',
      createdAt: new Date(baseTime.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      productId,
      type: 'reduce',
      amount: 25,
      beforeStock: 150,
      afterStock: 125,
      remark: '订单销售',
      operator: '系统',
      createdAt: new Date(baseTime.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      productId,
      type: 'add',
      amount: 50,
      beforeStock: 125,
      afterStock: 175,
      remark: '补货入库',
      operator: '仓库管理员',
      createdAt: new Date(baseTime.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// 审核状态定义
export const auditStatuses = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' }
}

// 生成审核统计数据
export const generateAuditStats = (products) => {
  const today = new Date().toDateString()
  const thisMonth = new Date().getMonth()
  
  return {
    pending: products.filter(p => p.status === 'pending').length,
    todayAudited: products.filter(p => 
      p.auditInfo && new Date(p.auditInfo.auditTime).toDateString() === today
    ).length,
    monthlyApproved: products.filter(p => 
      p.status === 'approved' && 
      p.auditInfo && 
      new Date(p.auditInfo.auditTime).getMonth() === thisMonth
    ).length,
    monthlyRejected: products.filter(p => 
      p.status === 'rejected' && 
      p.auditInfo && 
      new Date(p.auditInfo.auditTime).getMonth() === thisMonth
    ).length
  }
}

// 生成库存调整记录
export const generateStockAdjustments = (productId, count = 5) => {
  const adjustments = []
  const types = ['入库', '出库', '盘点', '退货', '损耗']
  const reasons = ['采购入库', '销售出库', '库存盘点', '客户退货', '商品损坏']
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const isInbound = type === '入库' || type === '盘点' || type === '退货'
    
    adjustments.push({
      id: Date.now() + i,
      productId,
      type,
      quantity: isInbound ? Math.floor(Math.random() * 100) + 1 : -(Math.floor(Math.random() * 50) + 1),
      reason: reasons[types.indexOf(type)],
      operator: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      remark: Math.random() > 0.5 ? '正常调整' : ''
    })
  }
  
  return adjustments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 生成实际的商品数据
export const products = generateMockProducts(100) // 生成100个商品

export default {
  categories,
  suppliers,
  shippingTemplates,
  productStatuses,
  commonTags,
  products,
  generateMockProducts,
  generateAuditHistory,
  generateStockHistory,
  auditStatuses,
  generateAuditStats,
  generateStockAdjustments
} 