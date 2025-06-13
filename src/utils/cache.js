/**
 * 清除应用缓存
 * 当应用发生Chunk加载错误或其他缓存相关问题时使用
 */
export function clearAppCache() {
  // 清除localStorage中的非关键数据
  // 注意：保留认证相关数据
  const authToken = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // 仅保留认证相关信息
  localStorage.clear();
  
  if (authToken) {
    localStorage.setItem('token', authToken);
  }
  
  if (userType) {
    localStorage.setItem('userType', userType);
  }
  
  // 如果应用使用了Service Worker，可以尝试注销
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // 清除应用缓存
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  console.log('应用缓存已清除');
  return true;
} 