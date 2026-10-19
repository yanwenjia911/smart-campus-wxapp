// pages/notice/detail.js
import request from '../../utils/request';

Page({
  data: {
    notice: {},
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.fetchNotice(id);
    }
  },

  async fetchNotice(id) {
    this.setData({ loading: true });
    try {
      const res = await request({ url: `/notice/${id}` });
      this.setData({ notice: res.data || {}, loading: false });
      // 设置标题
      if (res.data && res.data.title) {
        wx.setNavigationBarTitle({ title: res.data.title });
      }
    } catch {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
