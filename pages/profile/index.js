// pages/profile/index.js
import { logout } from '../../utils/auth';

Page({
  data: {
    user: null
  },

  onShow() {
    const user = wx.getStorageSync('userInfo');
    this.setData({ user });
  },

  goToGrade() {
    wx.navigateTo({ url: '/pages/grade/index' });
  },

  goToCourse() {
    wx.switchTab({ url: '/pages/course/index' });
  },

  goToCard() {
    wx.navigateTo({ url: '/pages/card/index' });
  },

  goToRepair() {
    wx.navigateTo({ url: '/pages/repair/index' });
  },

  goToNotice() {
    wx.navigateTo({ url: '/pages/notice/index' });
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
        }
      }
    });
  }
});