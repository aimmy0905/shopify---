const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  
  // 配置路径别名
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  
  // 配置SCSS全局变量
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/global.scss";`
      }
    }
  },
  
  // 开发服务器配置
  devServer: {
    port: 8081,
    open: true,
    host: 'localhost',
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/merchant\/.*$/, to: '/index.html' },
        { from: /^\/admin\/.*$/, to: '/index.html' },
        { from: /./, to: '/index.html' }
      ]
    }
  }
})
