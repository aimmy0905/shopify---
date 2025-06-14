// 简单的国际化工具
import { ref, reactive } from 'vue'

// 当前语言，默认中文
export const currentLang = ref(localStorage.getItem('language') || 'zh')

// 语言包
const messages = {
  zh: {
    // 导航菜单
    dashboard: 'Dashboard',
    myStores: '我的店铺',
    productManagement: '商品管理',
    platformProducts: '平台商品',
    importProducts: '导入商品列表',
    myProducts: '我的商品',
    orderManagement: '订单管理',
    storeOrders: '店铺订单',
    purchaseOrders: '采购订单',
    aftersaleOrders: '售后订单',
    purchaseManagement: '采购管理',
    balanceManagement: '余额管理',
    commissionManagement: '佣金管理',
    invoiceManagement: 'Invoice管理',
    logisticsInfo: '物流信息',
    personalSettings: '个人设置',
    customerSupport: '客服支持',
    
    // 顶部导航
    home: '首页',
    profile: '个人资料',
    logout: '退出登录',
    merchant: '商家用户',
    
    // 语言切换
    language: '语言',
    chinese: '中文',
    english: 'English'
  },
  en: {
    // 导航菜单
    dashboard: 'Dashboard',
    myStores: 'My Stores',
    productManagement: 'Product Management',
    platformProducts: 'Platform Products',
    importProducts: 'Import Products',
    myProducts: 'My Products',
    orderManagement: 'Order Management',
    storeOrders: 'Store Orders',
    purchaseOrders: 'Purchase Orders',
    aftersaleOrders: 'Aftersale Orders',
    purchaseManagement: 'Purchase Management',
    balanceManagement: 'Balance Management',
    commissionManagement: 'Commission Management',
    invoiceManagement: 'Invoice Management',
    logisticsInfo: 'Logistics Info',
    personalSettings: 'Personal Settings',
    customerSupport: 'Customer Support',
    
    // 顶部导航
    home: 'Home',
    profile: 'Profile',
    logout: 'Logout',
    merchant: 'Merchant User',
    
    // 语言切换
    language: 'Language',
    chinese: '中文',
    english: 'English'
  }
}

// 获取翻译文本
export const t = (key) => {
  return messages[currentLang.value]?.[key] || key
}

// 切换语言
export const switchLanguage = (lang) => {
  currentLang.value = lang
  localStorage.setItem('language', lang)
  console.log(`语言已切换到: ${lang === 'zh' ? '中文' : 'English'}`)
}

// 获取当前语言选项
export const getLanguageOptions = () => [
  { label: messages[currentLang.value].chinese, value: 'zh' },
  { label: messages[currentLang.value].english, value: 'en' }
] 