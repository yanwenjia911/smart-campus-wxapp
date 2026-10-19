// pages/teacher/index.js
import request from '../../utils/request';

Page({
  data: {
    teachers: [],
    loading: true
  },

  onLoad() {
    this.fetchTeachers();
  },

  async fetchTeachers() {
    try {
      const res = await request({ url: '/teacher/list' });
      this.setData({ teachers: res.data || [], loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  }
});