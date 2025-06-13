import { clearAppCache } from '@/utils/cache';

// 路由错误处理函数
export function setupRouterErrorHandling(router) {
  // 捕获路由加载失败的错误
  router.onError((error) => {
    console.error('路由加载错误:', error);
    
    // 检查是否是Chunk加载失败错误 (通常是由于网络问题或代码分割加载失败)
    if (error.name === 'ChunkLoadError') {
      console.log('发生Chunk加载错误，尝试清除缓存并重新加载...');
      
      // 清除应用缓存
      clearAppCache();
      
      // 如果是Chunk加载错误，通常是因为缓存问题，尝试刷新页面
      window.location.reload();
    }
  });
  
  return router;
} 