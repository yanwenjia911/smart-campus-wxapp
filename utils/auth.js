// utils/auth.js
import request from './request';

/**
 * 微信登录并绑定学号
 * @param {string} code - wx.login() 获取的 code
 * @param {string} studentId - 学号（首次登录时需要）
 * @param {string} name - 姓名（首次登录时需要）
 */
export async function login(code, studentId, name) {
  const res = await request({
    url: '/user/login',  // 修正：实际后端路径
    method: 'POST',
    data: { code, studentId, name }
  });
  // 后端 R<LoginVO>，数据在 res.data
  const loginData = res.data || res;
  if (loginData.token) {
    wx.setStorageSync('token', loginData.token);
    wx.setStorageSync('userInfo', { nickname: loginData.nickname, role: loginData.role });
  }
  return loginData;
}

export function logout() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  wx.reLaunch({ url: '/pages/auth/index' });
}

/**
 * 检查是否已登录，未登录则跳转
 */
export function checkLogin() {
  const token = wx.getStorageSync('token');
  if (!token) {
    wx.reLaunch({ url: '/pages/auth/index' });
    return false;
  }
  return true;
}