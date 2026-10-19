// utils/request.js
// 注意：getApp() 不能在模块顶层调用，必须在函数内部调用
// 否则 App 尚未初始化会返回 undefined

const BASE_URL = 'http://127.0.0.1:8080/api';

/**
 * 封装 wx.request，自动附带 token，统一处理错误
 */
export default function request({ url, method = 'GET', data = {}, headers = {} }) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    // 在函数内部获取 app，避免模块加载时 App 未初始化
    let apiBase = BASE_URL;
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.apiBase) {
        apiBase = app.globalData.apiBase;
      }
    } catch (e) {
      // getApp() 失败时使用默认地址
    }

    wx.request({
      url: apiBase + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...headers
      },
      success(res) {
        if (res.statusCode === 200) {
          const body = res.data;
          
          // 【核心修改点】：同时兼容 code = 200 和 code = 0 的成功状态
          if (body && body.code !== undefined && body.code !== 200 && body.code !== 0) {
            wx.showToast({ title: body.message || '操作失败', icon: 'none', duration: 2000 });
            reject(body);
          } else {
            resolve(body);
          }
          
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          setTimeout(() => wx.reLaunch({ url: '/pages/auth/index' }), 1500);
          reject(res.data);
        } else {
          wx.showToast({ title: (res.data && res.data.message) || `请求失败(${res.statusCode})`, icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请检查连接', icon: 'none', duration: 2000 });
        reject(err);
      }
    });
  });
}