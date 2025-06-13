/**
 * 日期时间格式化工具
 */

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateTime) return '-'
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  return formatDateTime(date, format)
}

/**
 * 格式化时间
 * @param {string|Date} time - 时间
 * @param {string} format - 格式化模板，默认 'HH:mm:ss'
 * @returns {string} 格式化后的时间
 */
export function formatTime(time, format = 'HH:mm:ss') {
  return formatDateTime(time, format)
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {number} precision - 小数位数，默认2位
 * @param {string} currency - 货币符号，默认$
 * @returns {string} 格式化后的金额
 */
export function formatAmount(amount, precision = 2, currency = '$') {
  if (typeof amount !== 'number') return '-'
  return `${currency}${amount.toFixed(precision)}`
}

/**
 * 格式化数字，添加千分位分隔符
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '-'
  return num.toLocaleString()
}

/**
 * 相对时间格式化（多久前）
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 相对时间描述
 */
export function formatRelativeTime(dateTime) {
  if (!dateTime) return '-'
  
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '-'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 12 * month
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '-'
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export default {
  formatDateTime,
  formatDate,
  formatTime,
  formatAmount,
  formatNumber,
  formatRelativeTime,
  formatFileSize
} 