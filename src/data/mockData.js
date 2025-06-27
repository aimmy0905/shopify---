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
  { label: '已下架', value: 'unpublished', color: 'warning' },
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

// 采购申请状态定义
export const purchaseApplicationStatuses = {
  pending: { text: '待处理', color: 'warning' },
  quotation_pending: { text: '待报价', color: 'info' },
  quotation_processing: { text: '报价中', color: 'primary' },
  quotation_success: { text: '报价成功', color: 'success' },
  quotation_failed: { text: '报价失败', color: 'danger' },
  rejected: { text: '已拒绝', color: 'danger' }
}

// 报价人员数据
export const quoters = [
  { id: 1, name: '张三', email: 'zhangsan@company.com', department: '采购部' },
  { id: 2, name: '李四', email: 'lisi@company.com', department: '采购部' },
  { id: 3, name: '王五', email: 'wangwu@company.com', department: '采购部' },
  { id: 4, name: '赵六', email: 'zhaoliu@company.com', department: '采购部' }
]

// 商家客户数据
export const customers = [
  {
    id: 1,
    name: '商家A',
    email: 'merchant_a@example.com',
    phone: '13800138001',
    company: 'A公司',
    address: '深圳市南山区科技园',
    balances: {
      USD: 15000.00,
      CNY: 8500.00,
      EUR: 2300.00
    },
    frozen_balances: {
      USD: 0.00,
      CNY: 0.00,
      EUR: 0.00
    },
    total_recharge: {
      USD: 25000.00,
      CNY: 15000.00,
      EUR: 5000.00
    },
    total_consumption: {
      USD: 10000.00,
      CNY: 6500.00,
      EUR: 2700.00
    },
    total_commission: 1200.00, // 佣金统一用美元
    status: 'active',
    account_status: 'normal',
    created_at: '2023-01-15 10:30:00',
    last_transaction_at: '2023-12-20 14:25:00'
  },
  {
    id: 2,
    name: '商家B',
    email: 'merchant_b@example.com',
    phone: '13800138002',
    company: 'B公司',
    address: '广州市天河区CBD',
    balances: {
      USD: 8500.00,
      CNY: 12000.00,
      EUR: 1500.00
    },
    frozen_balances: {
      USD: 500.00,
      CNY: 0.00,
      EUR: 0.00
    },
    total_recharge: {
      USD: 15000.00,
      CNY: 18000.00,
      EUR: 3000.00
    },
    total_consumption: {
      USD: 6000.00,
      CNY: 6000.00,
      EUR: 1500.00
    },
    total_commission: 800.00,
    status: 'active',
    account_status: 'normal',
    created_at: '2023-02-20 09:15:00',
    last_transaction_at: '2023-12-19 16:40:00'
  },
  {
    id: 3,
    name: '商家C',
    email: 'merchant_c@example.com',
    phone: '13800138003',
    company: 'C公司',
    address: '上海市浦东新区',
    balances: {
      USD: 22000.00,
      CNY: 5000.00,
      EUR: 3500.00
    },
    frozen_balances: {
      USD: 0.00,
      CNY: 0.00,
      EUR: 0.00
    },
    total_recharge: {
      USD: 35000.00,
      CNY: 8000.00,
      EUR: 6000.00
    },
    total_consumption: {
      USD: 13000.00,
      CNY: 3000.00,
      EUR: 2500.00
    },
    total_commission: 2100.00,
    status: 'active',
    account_status: 'normal',
    created_at: '2023-03-10 11:20:00',
    last_transaction_at: '2023-12-20 10:15:00'
  },
  {
    id: 4,
    name: '商家D',
    email: 'merchant_d@example.com',
    phone: '13800138004',
    company: 'D公司',
    address: '北京市朝阳区',
    balances: {
      USD: 5200.00,
      CNY: 3000.00,
      EUR: 800.00
    },
    frozen_balances: {
      USD: 1000.00,
      CNY: 500.00,
      EUR: 0.00
    },
    total_recharge: {
      USD: 12000.00,
      CNY: 8000.00,
      EUR: 2000.00
    },
    total_consumption: {
      USD: 5800.00,
      CNY: 4500.00,
      EUR: 1200.00
    },
    total_commission: 450.00,
    status: 'active',
    account_status: 'frozen',
    created_at: '2023-04-05 14:45:00',
    last_transaction_at: '2023-12-18 13:30:00'
  },
  {
    id: 5,
    name: '商家E',
    email: 'merchant_e@example.com',
    phone: '13800138005',
    company: 'E公司',
    address: '杭州市西湖区',
    balances: {
      USD: 18500.00,
      CNY: 6500.00,
      EUR: 2800.00
    },
    frozen_balances: {
      USD: 0.00,
      CNY: 0.00,
      EUR: 0.00
    },
    total_recharge: {
      USD: 28000.00,
      CNY: 12000.00,
      EUR: 4500.00
    },
    total_consumption: {
      USD: 9500.00,
      CNY: 5500.00,
      EUR: 1700.00
    },
    total_commission: 1650.00,
    status: 'active',
    account_status: 'normal',
    created_at: '2023-05-12 16:20:00',
    last_transaction_at: '2023-12-20 09:45:00'
  }
]

// 余额交易记录
export const balanceTransactions = [
  {
    id: 'BT202312001',
    customer_id: 1,
    customer_name: '商家A',
    type: 'recharge',
    currency: 'USD',
    amount: 5000.00,
    exchange_rate: 1.0,
    usd_amount: 5000.00,
    balance_before: 10000.00,
    balance_after: 15000.00,
    description: '在线充值',
    payment_method: 'alipay',
    transaction_id: 'ALI202312001',
    status: 'completed',
    created_at: '2023-12-20 14:25:00',
    processed_by: '系统自动',
    remark: '支付宝在线充值'
  },
  {
    id: 'BT202312002',
    customer_id: 1,
    customer_name: '商家A',
    type: 'consumption',
    currency: 'USD',
    amount: -2500.00,
    exchange_rate: 1.0,
    usd_amount: -2500.00,
    balance_before: 15000.00,
    balance_after: 12500.00,
    description: '采购订单支付',
    payment_method: null,
    transaction_id: 'PO202312002',
    status: 'completed',
    created_at: '2023-12-19 16:30:00',
    processed_by: '系统自动',
    remark: '订单PO202312002支付'
  },
  {
    id: 'BT202312003',
    customer_id: 2,
    customer_name: '商家B',
    type: 'recharge',
    currency: 'CNY',
    amount: 20000.00,
    exchange_rate: 0.14,
    usd_amount: 2800.00,
    balance_before: 40000.00,
    balance_after: 60000.00,
    description: '银行转账充值',
    payment_method: 'bank_transfer',
    transaction_id: 'BANK202312003',
    status: 'completed',
    created_at: '2023-12-19 16:40:00',
    processed_by: '财务部-张三',
    remark: '银行转账充值，已核实到账'
  },
  {
    id: 'BT202312004',
    customer_id: 3,
    customer_name: '商家C',
    type: 'commission',
    currency: 'USD',
    amount: 150.00,
    exchange_rate: 1.0,
    usd_amount: 150.00,
    balance_before: 21850.00,
    balance_after: 22000.00,
    description: '推荐佣金',
    payment_method: null,
    transaction_id: 'COM202312004',
    status: 'completed',
    created_at: '2023-12-20 10:15:00',
    processed_by: '系统自动',
    remark: '推荐新客户佣金奖励'
  },
  {
    id: 'BT202312005',
    customer_id: 4,
    customer_name: '商家D',
    type: 'freeze',
    currency: 'USD',
    amount: -1000.00,
    exchange_rate: 1.0,
    usd_amount: -1000.00,
    balance_before: 6200.00,
    balance_after: 5200.00,
    description: '资金冻结',
    payment_method: null,
    transaction_id: 'FREEZE202312005',
    status: 'completed',
    created_at: '2023-12-18 13:30:00',
    processed_by: '风控部-李四',
    remark: '异常交易风险控制，临时冻结部分资金'
  },
  {
    id: 'BT202312006',
    customer_id: 2,
    customer_name: '商家B',
    type: 'consumption',
    currency: 'EUR',
    amount: -800.00,
    exchange_rate: 1.08,
    usd_amount: -864.00,
    balance_before: 2300.00,
    balance_after: 1500.00,
    description: '欧洲订单支付',
    payment_method: null,
    transaction_id: 'PO202312006',
    status: 'completed',
    created_at: '2023-12-18 11:20:00',
    processed_by: '系统自动',
    remark: '欧洲区域订单支付'
  },
  {
    id: 'BT202312007',
    customer_id: 1,
    customer_name: '商家A',
    type: 'commission',
    currency: 'USD',
    amount: 120.00,
    exchange_rate: 1.0,
    usd_amount: 120.00,
    balance_before: 14880.00,
    balance_after: 15000.00,
    description: '推荐佣金',
    payment_method: null,
    transaction_id: 'COM202312007',
    status: 'completed',
    created_at: '2023-12-19 09:30:00',
    processed_by: '系统自动',
    remark: '推荐新客户佣金奖励'
  },
  {
    id: 'BT202312008',
    customer_id: 1,
    customer_name: '商家A',
    type: 'commission',
    currency: 'USD',
    amount: 85.50,
    exchange_rate: 1.0,
    usd_amount: 85.50,
    balance_before: 15000.00,
    balance_after: 15085.50,
    description: '级别奖励佣金',
    payment_method: null,
    transaction_id: 'COM202312008',
    status: 'completed',
    created_at: '2023-12-18 15:45:00',
    processed_by: '系统自动',
    remark: '等级提升奖励'
  },
  {
    id: 'BT202312009',
    customer_id: 2,
    customer_name: '商家B',
    type: 'commission',
    currency: 'USD',
    amount: 95.00,
    exchange_rate: 1.0,
    usd_amount: 95.00,
    balance_before: 8405.00,
    balance_after: 8500.00,
    description: '推荐佣金',
    payment_method: null,
    transaction_id: 'COM202312009',
    status: 'completed',
    created_at: '2023-12-17 14:20:00',
    processed_by: '系统自动',
    remark: '推荐新客户佣金奖励'
  },
  {
    id: 'BT202312010',
    customer_id: 2,
    customer_name: '商家B',
    type: 'commission',
    currency: 'USD',
    amount: 65.75,
    exchange_rate: 1.0,
    usd_amount: 65.75,
    balance_before: 8339.25,
    balance_after: 8405.00,
    description: '消费返佣',
    payment_method: null,
    transaction_id: 'COM202312010',
    status: 'completed',
    created_at: '2023-12-16 11:10:00',
    processed_by: '系统自动',
    remark: '下级用户消费返佣'
  },
  {
    id: 'BT202312011',
    customer_id: 4,
    customer_name: '商家D',
    type: 'commission',
    currency: 'USD',
    amount: 45.00,
    exchange_rate: 1.0,
    usd_amount: 45.00,
    balance_before: 5155.00,
    balance_after: 5200.00,
    description: '推荐佣金',
    payment_method: null,
    transaction_id: 'COM202312011',
    status: 'completed',
    created_at: '2023-12-15 16:30:00',
    processed_by: '系统自动',
    remark: '推荐新客户佣金奖励'
  },
  {
    id: 'BT202312012',
    customer_id: 5,
    customer_name: '商家E',
    type: 'commission',
    currency: 'USD',
    amount: 180.00,
    exchange_rate: 1.0,
    usd_amount: 180.00,
    balance_before: 18320.00,
    balance_after: 18500.00,
    description: '团队业绩佣金',
    payment_method: null,
    transaction_id: 'COM202312012',
    status: 'completed',
    created_at: '2023-12-14 10:15:00',
    processed_by: '系统自动',
    remark: '团队月度业绩奖励'
  }
]

// 充值申请记录
export const rechargeApplications = [
  {
    id: 'RC202312001',
    customer_id: 1,
    customer_name: '商家A',
    currency: 'USD',
    amount: 5000.00,
    exchange_rate: 1.0,
    usd_amount: 5000.00,
    payment_method: 'alipay',
    payment_account: 'ali***@example.com',
    transaction_id: 'ALI202312001',
    voucher_url: 'https://example.com/vouchers/rc202312001.jpg',
    status: 'approved',
    apply_time: '2023-12-20 14:20:00',
    review_time: '2023-12-20 14:25:00',
    reviewer: '财务部-张三',
    review_remark: '支付宝充值，自动到账',
    created_at: '2023-12-20 14:20:00'
  },
  {
    id: 'RC202312002',
    customer_id: 2,
    customer_name: '商家B',
    currency: 'CNY',
    amount: 20000.00,
    exchange_rate: 0.14,
    usd_amount: 2800.00,
    payment_method: 'bank_transfer',
    payment_account: '招商银行***1234',
    transaction_id: 'BANK202312003',
    voucher_url: 'https://example.com/vouchers/rc202312002.jpg',
    status: 'approved',
    apply_time: '2023-12-19 15:30:00',
    review_time: '2023-12-19 16:40:00',
    reviewer: '财务部-张三',
    review_remark: '银行转账已核实到账',
    created_at: '2023-12-19 15:30:00'
  },
  {
    id: 'RC202312003',
    customer_id: 5,
    customer_name: '商家E',
    currency: 'USD',
    amount: 8000.00,
    exchange_rate: 1.0,
    usd_amount: 8000.00,
    payment_method: 'wechat_pay',
    payment_account: 'wx***@example.com',
    transaction_id: 'WX202312003',
    voucher_url: 'https://example.com/vouchers/rc202312003.jpg',
    status: 'pending',
    apply_time: '2023-12-20 16:15:00',
    review_time: null,
    reviewer: null,
    review_remark: null,
    created_at: '2023-12-20 16:15:00'
  },
  {
    id: 'RC202312004',
    customer_id: 3,
    customer_name: '商家C',
    currency: 'EUR',
    amount: 1800.00,
    exchange_rate: 1.08,
    usd_amount: 1944.00,
    payment_method: 'bank_transfer',
    payment_account: '工商银行***5678',
    transaction_id: 'BANK202312004',
    voucher_url: 'https://example.com/vouchers/rc202312004.jpg',
    status: 'rejected',
    apply_time: '2023-12-18 10:20:00',
    review_time: '2023-12-18 14:30:00',
    reviewer: '财务部-李四',
    review_remark: '转账凭证不清晰，请重新提交',
    created_at: '2023-12-18 10:20:00'
  },
  {
    id: 'RC202312005',
    customer_id: 4,
    customer_name: '商家D',
    currency: 'CNY',
    amount: 15000.00,
    exchange_rate: 0.14,
    usd_amount: 2100.00,
    payment_method: 'alipay',
    payment_account: 'ali***@merchant-d.com',
    transaction_id: 'ALI202312005',
    voucher_url: 'https://example.com/vouchers/rc202312005.jpg',
    status: 'pending',
    apply_time: '2023-12-21 09:30:00',
    review_time: null,
    reviewer: null,
    review_remark: null,
    created_at: '2023-12-21 09:30:00'
  }
]

// 提现申请记录
export const withdrawalApplications = [
  {
    id: 'WD202312001',
    customer_id: 1,
    customer_name: '商家A',
    currency: 'USD',
    amount: 2000.00,
    exchange_rate: 1.0,
    usd_amount: 2000.00,
    withdrawal_method: 'bank_transfer',
    bank_name: '中国银行',
    account_number: '6217***1234',
    account_holder: '张三',
    swift_code: 'BKCHCNBJ',
    status: 'pending',
    apply_time: '2023-12-21 10:30:00',
    review_time: null,
    reviewer: null,
    review_remark: null,
    processing_time: null,
    completed_time: null,
    transaction_id: null,
    fee_amount: 10.00,
    actual_amount: 1990.00,
    created_at: '2023-12-21 10:30:00'
  },
  {
    id: 'WD202312002',
    customer_id: 2,
    customer_name: '商家B',
    currency: 'CNY',
    amount: 15000.00,
    exchange_rate: 0.14,
    usd_amount: 2100.00,
    withdrawal_method: 'alipay',
    alipay_account: 'merchant-b@example.com',
    account_holder: '李四',
    status: 'approved',
    apply_time: '2023-12-20 14:20:00',
    review_time: '2023-12-20 15:30:00',
    reviewer: '财务部-王五',
    review_remark: '审核通过，账户信息正确',
    processing_time: '2023-12-20 16:00:00',
    completed_time: null,
    transaction_id: 'ALI_WD_202312002',
    fee_amount: 75.00,
    actual_amount: 14925.00,
    created_at: '2023-12-20 14:20:00'
  },
  {
    id: 'WD202312003',
    customer_id: 3,
    customer_name: '商家C',
    currency: 'EUR',
    amount: 1500.00,
    exchange_rate: 1.08,
    usd_amount: 1620.00,
    withdrawal_method: 'bank_transfer',
    bank_name: 'Deutsche Bank',
    account_number: 'DE89***5678',
    account_holder: 'Wang Liu',
    swift_code: 'DEUTDEFF',
    status: 'completed',
    apply_time: '2023-12-19 09:15:00',
    review_time: '2023-12-19 11:20:00',
    reviewer: '财务部-张三',
    review_remark: '审核通过',
    processing_time: '2023-12-19 14:30:00',
    completed_time: '2023-12-20 10:45:00',
    transaction_id: 'SWIFT_WD_202312003',
    fee_amount: 25.00,
    actual_amount: 1475.00,
    created_at: '2023-12-19 09:15:00'
  },
  {
    id: 'WD202312004',
    customer_id: 4,
    customer_name: '商家D',
    currency: 'USD',
    amount: 500.00,
    exchange_rate: 1.0,
    usd_amount: 500.00,
    withdrawal_method: 'paypal',
    paypal_account: 'merchant-d@paypal.com',
    account_holder: '赵六',
    status: 'rejected',
    apply_time: '2023-12-18 16:45:00',
    review_time: '2023-12-19 09:30:00',
    reviewer: '财务部-李四',
    review_remark: 'PayPal账户信息不匹配，请重新提交',
    processing_time: null,
    completed_time: null,
    transaction_id: null,
    fee_amount: 5.00,
    actual_amount: 495.00,
    created_at: '2023-12-18 16:45:00'
  },
  {
    id: 'WD202312005',
    customer_id: 5,
    customer_name: '商家E',
    currency: 'CNY',
    amount: 8000.00,
    exchange_rate: 0.14,
    usd_amount: 1120.00,
    withdrawal_method: 'wechat_pay',
    wechat_account: 'wx_merchant_e',
    account_holder: '孙七',
    status: 'processing',
    apply_time: '2023-12-21 08:20:00',
    review_time: '2023-12-21 09:45:00',
    reviewer: '财务部-王五',
    review_remark: '审核通过，正在处理中',
    processing_time: '2023-12-21 10:15:00',
    completed_time: null,
    transaction_id: 'WX_WD_202312005',
    fee_amount: 40.00,
    actual_amount: 7960.00,
    created_at: '2023-12-21 08:20:00'
  }
]

// 充值规则设置
export const rechargeSettings = {
  // 支持的币种
  supportedCurrencies: [
    {
      code: 'USD',
      name: '美元',
      symbol: '$',
      enabled: true,
      minAmount: 10,
      maxAmount: 50000,
      dailyLimit: 100000,
      monthlyLimit: 500000,
      exchangeRate: 1.0,
      lastUpdated: '2023-12-21 10:00:00'
    },
    {
      code: 'CNY',
      name: '人民币',
      symbol: '¥',
      enabled: true,
      minAmount: 100,
      maxAmount: 300000,
      dailyLimit: 500000,
      monthlyLimit: 2000000,
      exchangeRate: 0.14,
      lastUpdated: '2023-12-21 10:00:00'
    },
    {
      code: 'EUR',
      name: '欧元',
      symbol: '€',
      enabled: true,
      minAmount: 10,
      maxAmount: 45000,
      dailyLimit: 90000,
      monthlyLimit: 450000,
      exchangeRate: 1.08,
      lastUpdated: '2023-12-21 10:00:00'
    }
  ],

  // 充值方式
  paymentMethods: [
    {
      id: 'alipay',
      name: '支付宝',
      enabled: true,
      supportedCurrencies: ['CNY'],
      accountInfo: {
        accountName: '铺货系统收款账户',
        accountNumber: 'shopify_system@alipay.com',
        qrCode: 'https://example.com/qr/alipay.png'
      },
      feeRate: 0.006,
      minAmount: 100,
      maxAmount: 50000,
      processingTime: '实时到账',
      description: '支持支付宝扫码支付和转账'
    },
    {
      id: 'wechat_pay',
      name: '微信支付',
      enabled: true,
      supportedCurrencies: ['CNY'],
      accountInfo: {
        accountName: '铺货系统收款账户',
        accountNumber: 'wx_shopify_system',
        qrCode: 'https://example.com/qr/wechat.png'
      },
      feeRate: 0.006,
      minAmount: 100,
      maxAmount: 50000,
      processingTime: '实时到账',
      description: '支持微信扫码支付和转账'
    },
    {
      id: 'bank_transfer',
      name: '银行转账',
      enabled: true,
      supportedCurrencies: ['USD', 'CNY', 'EUR'],
      accountInfo: {
        bankName: '中国银行',
        accountName: 'Shopify Dropshipping System Ltd.',
        accountNumber: '6217001234567890123',
        swiftCode: 'BKCHCNBJ',
        routingNumber: '026009593'
      },
      feeRate: 0.001,
      minAmount: 1000,
      maxAmount: 100000,
      processingTime: '1-3个工作日',
      description: '支持国内外银行转账'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: true,
      supportedCurrencies: ['USD', 'EUR'],
      accountInfo: {
        accountName: 'Shopify Dropshipping System',
        accountEmail: 'payments@shopify-dropshipping.com'
      },
      feeRate: 0.029,
      minAmount: 10,
      maxAmount: 10000,
      processingTime: '实时到账',
      description: '支持PayPal账户转账'
    }
  ],

  // 审核规则
  auditRules: {
    autoApprovalEnabled: true,
    autoApprovalLimit: {
      USD: 1000,
      CNY: 7000,
      EUR: 900
    },
    manualReviewRequired: {
      largeAmount: true,
      newCustomer: true,
      suspiciousActivity: true
    },
    reviewTimeLimit: 24, // 小时
    escalationRules: {
      enabled: true,
      escalationTime: 48, // 小时
      escalationTo: 'supervisor'
    }
  },

  // 风控设置
  riskControlSettings: {
    dailyLimitEnabled: true,
    monthlyLimitEnabled: true,
    velocityCheckEnabled: true,
    duplicateCheckEnabled: true,
    blacklistCheckEnabled: true,
    geoLocationCheckEnabled: false,
    deviceFingerprintEnabled: false
  },

  // 通知设置
  notificationSettings: {
    emailNotification: true,
    smsNotification: false,
    webhookNotification: true,
    webhookUrl: 'https://api.shopify-dropshipping.com/webhooks/recharge',
    notificationEvents: [
      'recharge_submitted',
      'recharge_approved',
      'recharge_rejected',
      'recharge_completed'
    ]
  }
}

// 提现规则设置
export const withdrawalSettings = {
  // 支持的提现方式
  withdrawalMethods: [
    {
      id: 'bank_transfer',
      name: '银行转账',
      enabled: true,
      supportedCurrencies: ['USD', 'CNY', 'EUR'],
      feeType: 'fixed', // fixed, percentage
      feeAmount: {
        USD: 15,
        CNY: 25,
        EUR: 12
      },
      minAmount: {
        USD: 100,
        CNY: 500,
        EUR: 90
      },
      maxAmount: {
        USD: 50000,
        CNY: 300000,
        EUR: 45000
      },
      processingTime: '1-3个工作日',
      description: '支持国内外银行转账提现'
    },
    {
      id: 'alipay',
      name: '支付宝',
      enabled: true,
      supportedCurrencies: ['CNY'],
      feeType: 'percentage',
      feeRate: 0.005,
      minAmount: {
        CNY: 100
      },
      maxAmount: {
        CNY: 50000
      },
      processingTime: '实时到账',
      description: '支持支付宝账户提现'
    },
    {
      id: 'wechat_pay',
      name: '微信支付',
      enabled: true,
      supportedCurrencies: ['CNY'],
      feeType: 'percentage',
      feeRate: 0.005,
      minAmount: {
        CNY: 100
      },
      maxAmount: {
        CNY: 50000
      },
      processingTime: '实时到账',
      description: '支持微信账户提现'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: true,
      supportedCurrencies: ['USD', 'EUR'],
      feeType: 'percentage',
      feeRate: 0.02,
      minAmount: {
        USD: 20,
        EUR: 18
      },
      maxAmount: {
        USD: 10000,
        EUR: 9000
      },
      processingTime: '1-2个工作日',
      description: '支持PayPal账户提现'
    }
  ],

  // 提现限制
  withdrawalLimits: {
    dailyLimit: {
      USD: 10000,
      CNY: 70000,
      EUR: 9000
    },
    monthlyLimit: {
      USD: 100000,
      CNY: 700000,
      EUR: 90000
    },
    minimumBalance: {
      USD: 10,
      CNY: 70,
      EUR: 9
    }
  },

  // 审核规则
  auditRules: {
    autoApprovalEnabled: false,
    manualReviewRequired: true,
    reviewTimeLimit: 24, // 小时
    escalationRules: {
      enabled: true,
      escalationTime: 48, // 小时
      escalationTo: 'finance_manager'
    },
    additionalVerification: {
      largeAmountThreshold: {
        USD: 5000,
        CNY: 35000,
        EUR: 4500
      },
      requiresPhoneVerification: true,
      requiresEmailVerification: true,
      requiresIdentityVerification: false
    }
  },

  // 工作时间设置
  businessHours: {
    enabled: true,
    timezone: 'Asia/Shanghai',
    workingDays: [1, 2, 3, 4, 5], // 周一到周五
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    holidayProcessing: false
  }
}

// 采购申请数据
export const purchaseApplications = [
  {
    id: 'PA202312001',
    merchant_id: 1,
    merchant_name: '商家A',
    type: 'existing',
    product_name: '蓝牙耳机Pro',
    product_image: 'https://picsum.photos/400/400?random=1001',
    product_url: 'https://example.com/product/bluetooth-earphone-pro',
    target_country: '美国',
    target_price: 29.99,
    daily_orders: 50,
    accept_similar: true,
    description: '高质量蓝牙耳机，支持降噪功能，续航时间长达8小时。适合运动和日常使用。',
    remark: '希望能找到性价比高的供应商，有现货库存。',
    status: 'pending',
    created_at: '2023-12-15 10:30:00',
    processed_at: null,
    processor: null,
    quoter_id: null,
    quoter: null,
    quoted_at: null,
    final_quote: null,
    reject_reason: null,
    quote_document: null,
    quote_remark: null
  },
  {
    id: 'PA202312002',
    merchant_id: 2,
    merchant_name: '商家B',
    type: 'external',
    product_name: '智能手表',
    product_image: 'https://picsum.photos/400/400?random=1002',
    product_url: 'https://aliexpress.com/item/smart-watch-fitness',
    target_country: '加拿大',
    target_price: 89.99,
    daily_orders: 30,
    accept_similar: false,
    description: '多功能智能手表，支持健康监测、运动追踪、消息提醒等功能。',
    remark: '需要支持中文界面，电池续航至少3天。',
    status: 'quotation_success',
    created_at: '2023-12-14 14:20:00',
    processed_at: '2023-12-15 09:15:00',
    processor: '管理员A',
    quoter_id: 1,
    quoter: '张三',
    quoted_at: '2023-12-15 16:30:00',
    final_quote: 89.50,
    reject_reason: null,
    quote_document: 'mock-quotation-PA202312002.html',
    quote_remark: '找到优质电子产品供应商，支持中文界面，续航符合要求。'
  },
  {
    id: 'PA202312003',
    merchant_id: 3,
    merchant_name: '商家C',
    type: 'existing',
    product_name: '无线充电器',
    product_image: 'https://picsum.photos/400/400?random=1003',
    product_url: 'https://example.com/product/wireless-charger',
    target_country: '英国',
    target_price: 25.00,
    daily_orders: 80,
    accept_similar: true,
    description: '15W快速无线充电器，支持多种设备，带LED指示灯。',
    remark: '需要通过CE认证，包装要求精美。',
    status: 'quotation_success',
    created_at: '2023-12-13 16:45:00',
    processed_at: '2023-12-14 10:30:00',
    processor: '管理员B',
    quoter_id: 2,
    quoter: '李四',
    quoted_at: '2023-12-14 15:20:00',
    final_quote: 25.00,
    reject_reason: null,
    quote_document: 'mock-quotation-PA202312002.html',
    quote_remark: '已联系3家供应商，找到符合CE认证要求的优质供应商。'
  },
  {
    id: 'PA202312004',
    merchant_id: 4,
    merchant_name: '商家D',
    type: 'external',
    product_name: '运动水杯',
    product_image: 'https://picsum.photos/400/400?random=1004',
    product_url: 'https://amazon.com/sports-water-bottle',
    target_country: '澳大利亚',
    target_price: 15.99,
    daily_orders: 120,
    accept_similar: true,
    description: '不锈钢保温运动水杯，容量750ml，防漏设计。',
    remark: '需要食品级材质，支持定制LOGO。',
    status: 'quotation_success',
    created_at: '2023-12-12 11:20:00',
    processed_at: '2023-12-13 09:00:00',
    processor: '管理员A',
    quoter_id: 3,
    quoter: '王五',
    quoted_at: '2023-12-13 14:30:00',
    final_quote: 12.50,
    reject_reason: null,
    quote_document: 'mock-quotation-PA202312004.html',
    quote_remark: '找到优质供应商，价格合理，质量可靠。'
  },
  {
    id: 'PA202312005',
    merchant_id: 1,
    merchant_name: '商家A',
    type: 'external',
    product_name: '手机支架',
    product_image: 'https://picsum.photos/400/400?random=1005',
    product_url: 'https://aliexpress.com/phone-stand-adjustable',
    target_country: '德国',
    target_price: 8.99,
    daily_orders: 200,
    accept_similar: false,
    description: '可调节手机支架，适用于各种尺寸手机，铝合金材质。',
    remark: '要求包装简洁环保，支持快速发货。',
    status: 'quotation_failed',
    created_at: '2023-12-11 09:15:00',
    processed_at: '2023-12-12 10:45:00',
    processor: '管理员B',
    quoter_id: 4,
    quoter: '赵六',
    quoted_at: '2023-12-12 16:20:00',
    final_quote: null,
    reject_reason: '目标价格过低，无法找到符合质量要求的供应商。建议提高预算至12-15美元。',
    quote_document: null,
    quote_remark: '联系了5家供应商，最低报价11.5美元，无法满足目标价格。'
  },
  {
    id: 'PA202312006',
    merchant_id: 2,
    merchant_name: '商家B',
    type: 'existing',
    product_name: 'USB数据线',
    product_image: 'https://picsum.photos/400/400?random=1006',
    product_url: 'https://example.com/product/usb-cable',
    target_country: '法国',
    target_price: 5.99,
    daily_orders: 300,
    accept_similar: true,
    description: '高速USB-C数据线，支持快充和数据传输，长度1米。',
    remark: '需要通过MFi认证，包装要求多语言标签。',
    status: 'rejected',
    created_at: '2023-12-10 13:30:00',
    processed_at: '2023-12-11 08:20:00',
    processor: '管理员A',
    quoter_id: null,
    quoter: null,
    quoted_at: null,
    final_quote: null,
    reject_reason: '商品描述不够详细，缺少技术规格参数，请补充完整信息后重新提交。',
    quote_document: null,
    quote_remark: null
  }
]

// 采购订单数据
export const purchaseOrders = [
  {
    id: 'PO202312001',
    application_id: 'PA202312004',
    customer_id: 4,
    customer_name: '商家D',
    status: 'paid',
    payment_status: 'paid',
    shipping_status: 'shipped',
    items: [
      {
        id: 1,
        product_name: '运动水杯',
        product_image: 'https://picsum.photos/400/400?random=1004',
        quantity: 100,
        unit_price: 12.50,
        total_price: 1250.00
      }
    ],
    subtotal: 1250.00,
    shipping_fee: 50.00,
    total_amount: 1300.00,
    currency: 'USD',
    exchange_rate: 1.0,
    usd_amount: 1300.00,
    receiver_name: '李经理',
    receiver_phone: '+61-400-123-456',
    receiver_address: '123 Collins Street, Melbourne, VIC 3000, Australia',
    tracking_number: 'TN202312001',
    shipping_company: 'DHL Express',
    shipped_at: '2023-12-16 10:30:00',
    estimated_delivery: '2023-12-20',
    remark: '客户要求加急处理，已安排快递发货。',
    created_at: '2023-12-15 14:20:00',
    paid_at: '2023-12-15 15:45:00'
  },
  {
    id: 'PO202312002',
    application_id: null,
    customer_id: 1,
    customer_name: '商家A',
    status: 'pending_payment',
    payment_status: 'pending',
    shipping_status: 'pending',
    items: [
      {
        id: 1,
        product_name: '蓝牙耳机Pro',
        product_image: 'https://picsum.photos/400/400?random=1001',
        quantity: 50,
        unit_price: 22.00,
        total_price: 1100.00
      },
      {
        id: 2,
        product_name: '手机保护壳',
        product_image: 'https://picsum.photos/400/400?random=1007',
        quantity: 100,
        unit_price: 8.50,
        total_price: 850.00
      }
    ],
    subtotal: 1950.00,
    shipping_fee: 80.00,
    total_amount: 2030.00,
    currency: 'USD',
    exchange_rate: 1.0,
    usd_amount: 2030.00,
    receiver_name: '张总',
    receiver_phone: '+86-138-0013-8001',
    receiver_address: '深圳市南山区科技园南区R2-A栋6楼',
    tracking_number: null,
    shipping_company: null,
    shipped_at: null,
    estimated_delivery: null,
    remark: '批量采购，请确保质量一致性。',
    created_at: '2023-12-16 09:15:00',
    paid_at: null
  }
]

// 生成客户余额数据
export const generateMockCustomers = (count = 20) => {
  const customers = []
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八', '韩十九', '杨二十']
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', '163.com', 'qq.com']
  
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length] + (i > names.length - 1 ? (Math.floor(i / names.length) + 1) : '')
    const email = `user${i + 1}@${domains[i % domains.length]}`
    
    customers.push({
      id: i + 1,
      name: name,
      email: email,
      currentBalance: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      totalRecharge: Math.round((Math.random() * 10000 + 500) * 100) / 100,
      totalConsumption: Math.round((Math.random() * 8000 + 200) * 100) / 100,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      balances: [
        {
          currency: 'USD',
          amount: Math.round((Math.random() * 2000 + 50) * 100) / 100
        },
        {
          currency: 'EUR',
          amount: Math.round((Math.random() * 1500 + 30) * 100) / 100
        }
      ],
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      registeredAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    })
  }
  
  return customers
}

// 生成充值记录数据
export const generateMockRecharges = (count = 30) => {
  const recharges = []
  const customerNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
  const methods = ['银行转账', '支付宝', '微信支付', 'PayPal', '信用卡']
  const statuses = ['pending', 'approved', 'rejected']
  const currencies = ['USD', 'EUR', 'GBP']
  const auditors = ['管理员A', '管理员B', '财务主管', '客服经理']
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    const auditDate = status !== 'pending' ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null
    
    recharges.push({
      id: `R${String(i + 1).padStart(6, '0')}`,
      customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
      amount: Math.round((Math.random() * 2000 + 50) * 100) / 100,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      status: status,
      createdAt: createdDate.toLocaleString(),
      auditor: status !== 'pending' ? auditors[Math.floor(Math.random() * auditors.length)] : '',
      auditTime: auditDate ? auditDate.toLocaleString() : '',
      proofUrl: `https://example.com/proof/receipt_${i + 1}.jpg`,
      remark: status === 'rejected' ? '凭证不清晰，请重新上传' : '',
      transactionId: `TXN${Date.now()}${i}`
    })
  }
  
  return recharges.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 生成充值方式数据
export const generateMockPaymentMethods = () => {
  return [
    {
      id: 'pm-1',
      name: '银行转账',
      accountName: '铺货系统有限公司',
      accountInfo: '工商银行：6222 0202 0000 1234 567',
      supportedCurrencies: ['USD', 'EUR'],
      description: '支持美元和欧元转账，到账时间1-3个工作日',
      enabled: true
    },
    {
      id: 'pm-2',
      name: 'PayPal',
      accountName: 'payments@example.com',
      accountInfo: 'PayPal商家账户：payments@example.com',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      description: '支持多种货币，即时到账',
      enabled: true
    },
    {
      id: 'pm-3',
      name: '支付宝',
      accountName: '铺货系统',
      accountInfo: '支付宝账号：13800138000',
      supportedCurrencies: ['USD'],
      description: '仅支持美元充值，需要汇率转换',
      enabled: true
    },
    {
      id: 'pm-4',
      name: '微信支付',
      accountName: '铺货系统',
      accountInfo: '微信收款码：见二维码',
      supportedCurrencies: ['USD'],
      description: '扫码支付，快速便捷',
      enabled: false
    }
  ]
}

// 生成推荐人数据
export const generateMockReferrers = (count = 15) => {
  const referrers = []
  const names = ['张推荐', '李分享', '王介绍', '赵推广', '钱营销', '孙代理', '周经理', '吴总监', '郑主管', '王顾问', '冯专员', '陈助理', '褚代表', '卫经纪', '蒋中介']
  const levels = ['普通推荐人', '银牌推荐人', '金牌推荐人', '钻石推荐人', '皇冠推荐人']
  const statuses = ['active', 'inactive', 'suspended']
  
  for (let i = 0; i < count; i++) {
    const joinDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    const lastActiveDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    referrers.push({
      id: i + 1,
      name: names[i % names.length] + (i >= names.length ? (Math.floor(i / names.length) + 1) : ''),
      email: `referrer${i + 1}@example.com`,
      phone: `138${String(i + 1).padStart(8, '0')}`,
      level: levels[Math.floor(Math.random() * levels.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalReferrals: Math.floor(Math.random() * 50) + 1,
      activeReferrals: Math.floor(Math.random() * 30) + 1,
      totalCommission: Math.round((Math.random() * 10000 + 500) * 100) / 100,
      thisMonthCommission: Math.round((Math.random() * 2000 + 100) * 100) / 100,
      commissionRate: (Math.random() * 0.1 + 0.05).toFixed(3), // 5%-15%
      joinDate: joinDate.toLocaleDateString(),
      lastActiveDate: lastActiveDate.toLocaleDateString(),
      bankAccount: `622202${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
      bankName: ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行'][Math.floor(Math.random() * 5)],
      accountHolder: names[i % names.length] + (i >= names.length ? (Math.floor(i / names.length) + 1) : ''),
      remark: i % 3 === 0 ? '表现优秀的推荐人' : i % 3 === 1 ? '需要加强培训' : ''
    })
  }
  
  return referrers.sort((a, b) => b.totalCommission - a.totalCommission)
}

// 生成佣金结算记录数据
export const generateMockCommissionSettlements = (count = 25) => {
  const settlements = []
  const referrerNames = ['张推荐', '李分享', '王介绍', '赵推广', '钱营销', '孙代理', '周经理', '吴总监', '郑主管', '王顾问']
  const statuses = ['pending', 'processing', 'completed', 'failed']
  const settlementTypes = ['monthly', 'weekly', 'manual']
  
  for (let i = 0; i < count; i++) {
    const settlementDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    const processDate = new Date(settlementDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    settlements.push({
      id: `CS${String(i + 1).padStart(6, '0')}`,
      referrerId: Math.floor(Math.random() * 15) + 1,
      referrerName: referrerNames[Math.floor(Math.random() * referrerNames.length)],
      settlementType: settlementTypes[Math.floor(Math.random() * settlementTypes.length)],
      period: `${settlementDate.getFullYear()}-${String(settlementDate.getMonth() + 1).padStart(2, '0')}`,
      totalAmount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      commissionCount: Math.floor(Math.random() * 20) + 1,
      status: status,
      settlementDate: settlementDate.toLocaleDateString(),
      processDate: status !== 'pending' ? processDate.toLocaleDateString() : '',
      processor: status !== 'pending' ? '财务部-张三' : '',
      bankAccount: `622202${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
      bankName: ['工商银行', '建设银行', '农业银行', '中国银行', '招商银行'][Math.floor(Math.random() * 5)],
      transactionId: status === 'completed' ? `TXN${Date.now()}${i}` : '',
      remark: status === 'failed' ? '银行账户信息有误，请核实' : status === 'completed' ? '结算成功' : '',
      createdAt: settlementDate.toLocaleString()
    })
  }
  
  return settlements.sort((a, b) => new Date(b.settlementDate) - new Date(a.settlementDate))
}

// 生成佣金规则数据
export const generateMockCommissionRules = () => {
  return [
    {
      id: 1,
      name: '基础推荐佣金',
      type: 'referral',
      description: '推荐新客户注册并完成首次充值',
      commissionRate: 0.05, // 5%
      minAmount: 100,
      maxAmount: 1000,
      level: 1,
      enabled: true,
      conditions: [
        '新客户必须完成实名认证',
        '首次充值金额不少于100美元',
        '推荐关系必须在30天内建立'
      ],
      createdAt: '2023-01-15 10:00:00',
      updatedAt: '2023-12-01 14:30:00'
    },
    {
      id: 2,
      name: '二级推荐佣金',
      type: 'sub_referral',
      description: '下级推荐人产生的佣金分成',
      commissionRate: 0.02, // 2%
      minAmount: 50,
      maxAmount: 500,
      level: 2,
      enabled: true,
      conditions: [
        '推荐人等级达到银牌以上',
        '下级推荐人必须是活跃状态',
        '分成比例根据推荐人等级调整'
      ],
      createdAt: '2023-02-01 09:00:00',
      updatedAt: '2023-11-15 16:20:00'
    },
    {
      id: 3,
      name: '消费返佣',
      type: 'consumption',
      description: '推荐客户消费产生的返佣',
      commissionRate: 0.01, // 1%
      minAmount: 10,
      maxAmount: 200,
      level: 1,
      enabled: true,
      conditions: [
        '客户消费金额不少于50美元',
        '仅限于采购订单消费',
        '每月返佣上限200美元'
      ],
      createdAt: '2023-03-01 11:00:00',
      updatedAt: '2023-10-20 13:45:00'
    },
    {
      id: 4,
      name: '等级奖励佣金',
      type: 'level_bonus',
      description: '推荐人等级提升奖励',
      commissionRate: 0, // 固定金额
      minAmount: 500,
      maxAmount: 5000,
      level: 0,
      enabled: true,
      conditions: [
        '推荐人等级提升时一次性奖励',
        '银牌奖励500美元，金牌1000美元',
        '钻石2000美元，皇冠5000美元'
      ],
      createdAt: '2023-04-01 15:00:00',
      updatedAt: '2023-09-10 10:15:00'
    },
    {
      id: 5,
      name: '团队业绩佣金',
      type: 'team_performance',
      description: '团队整体业绩达标奖励',
      commissionRate: 0.005, // 0.5%
      minAmount: 100,
      maxAmount: 2000,
      level: 1,
      enabled: false,
      conditions: [
        '团队月度业绩达到10万美元',
        '团队成员不少于10人',
        '团队活跃度不低于80%'
      ],
      createdAt: '2023-05-01 12:00:00',
      updatedAt: '2023-12-15 09:30:00'
    }
  ]
}

// 生成实际的商品数据
export const products = generateMockProducts(100) // 生成100个商品

// 佣金管理相关数据
export const commissionData = {
  // 推荐人列表
  referrers: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      inviteCode: 'JS001',
      totalReferrals: 25,
      totalCommission: 2580.50,
      settledCommission: 1850.30,
      pendingCommission: 730.20,
      status: 'active',
      joinTime: '2023-01-15 10:30:00'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      inviteCode: 'SJ002',
      totalReferrals: 18,
      totalCommission: 1920.75,
      settledCommission: 1200.50,
      pendingCommission: 720.25,
      status: 'active',
      joinTime: '2023-02-20 14:15:00'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@example.com',
      inviteCode: 'MW003',
      totalReferrals: 32,
      totalCommission: 3250.80,
      settledCommission: 2100.60,
      pendingCommission: 1150.20,
      status: 'active',
      joinTime: '2023-01-08 09:45:00'
    }
  ],

  // 结算记录
  settlements: [
    {
      id: 'ST001',
      userId: 1,
      userName: 'John Smith',
      userEmail: 'john.smith@example.com',
      settlementTime: '2023-12-01 10:00:00',
      settlementPeriod: '2023年11月',
      amount: 850.30,
      balanceBefore: 1200.50,
      balanceAfter: 2050.80,
      remark: '月度自动结算',
      status: 'completed'
    },
    {
      id: 'ST002',
      userId: 2,
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@example.com',
      settlementTime: '2023-12-01 10:05:00',
      settlementPeriod: '2023年11月',
      amount: 620.75,
      balanceBefore: 980.25,
      balanceAfter: 1601.00,
      remark: '月度自动结算',
      status: 'completed'
    }
  ],

  // 佣金规则配置
  commissionRules: {
    firstLevelRate: 5.0,
    secondLevelRate: 2.0,
    minSettlementAmount: 10.00,
    autoSettlementEnabled: true,
    settlementCycle: 'monthly',
    settlementDay: 1,
    emailNotificationEnabled: true,
    systemNotificationEnabled: true,
    smsNotificationEnabled: false,
    commissionValidDays: 365,
    maxReferralLevels: 2,
    newUserProtectionDays: 30
  }
}

export default {
  categories,
  suppliers,
  shippingTemplates,
  productStatuses,
  commonTags,
  products,
  purchaseApplicationStatuses,
  quoters,
  customers,
  balanceTransactions,
  rechargeApplications,
  withdrawalApplications,
  purchaseApplications,
  purchaseOrders,
  generateMockProducts,
  generateAuditHistory,
  generateStockHistory,
  auditStatuses,
  generateAuditStats,
  generateStockAdjustments,
  generateMockCustomers,
  generateMockRecharges,
  generateMockPaymentMethods,
  generateMockReferrers,
  generateMockCommissionSettlements,
  generateMockCommissionRules,
  commissionData
}