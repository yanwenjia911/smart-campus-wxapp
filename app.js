// app.js
App({
  onLaunch() {
    // 检查是否已登录
    // 注意：onLaunch 阶段不能做页面跳转，页面还未就绪
    // 登录检查交给各页面的 onLoad / onShow 处理
    const token = wx.getStorageSync('token');
    this.globalData.token = token || null;
  },

  onShow() {
    // App 显示时检查登录状态（可选）
  },

  globalData: {
    userInfo: null,
    token: null,
    apiBase: 'http://127.0.0.1:8080/api' // 后端接口地址
  }
});