// pages/teacher/course.js
import request from '../../utils/request';

Page({
  data: {
    courses: [],
    loading: true
  },

  onLoad() {
    this.fetchTeacherCourses();
  },

  async fetchTeacherCourses() {
    try {
      const res = await request({ url: '/teacher/course/list' });
      this.setData({ courses: res.data || [], loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goToStudents(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/teacher/course-students?courseId=${courseId}` });
  }
});