// pages/teacher/course-students.js
import request from '../../utils/request';

Page({
  data: {
    students: [],
    courseName: '',
    loading: true
  },

  onLoad(options) {
    const courseId = options.courseId;
    this.fetchCourseStudents(courseId);
  },

  async fetchCourseStudents(courseId) {
    try {
      const res = await request({ url: `/teacher/course/${courseId}/students` });
      this.setData({ 
        students: res.data.students || [],
        courseName: res.data.courseName,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  handleScoreInput(e) {
    const index = e.currentTarget.dataset.index;
    const score = e.detail.value;
    this.setData({ [`students[${index}].score`]: score });
  },

  async saveScores() {
    const { students } = this.data;
    try {
      const res = await request({
        url: '/teacher/course/save-scores',
        method: 'POST',
        data: { students: students.map(s => ({ id: s.id, score: s.score })) }
      });
      wx.showToast({ title: '成绩已保存', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    }
  }
});