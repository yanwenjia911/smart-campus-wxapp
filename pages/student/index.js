// pages/student/index.js
import request from '../../utils/request';

Page({
  data: {
    students: [],
    loading: true
  },

  onLoad() {
    this.fetchStudents();
  },

  async fetchStudents() {
    try {
      const res = await request({ url: '/student/list' });
      this.setData({ students: res.data || [], loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  }
});