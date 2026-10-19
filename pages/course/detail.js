// pages/course/detail.js
const WEEK_DAYS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 课程节次对应时间（标准8节课制）
const CLASS_TIME_MAP = {
  1: ['08:00 - 08:45', '08:55 - 09:40'],
  2: ['08:55 - 09:40'],
  3: ['10:00 - 10:45', '10:55 - 11:40'],
  4: ['10:55 - 11:40'],
  5: ['14:00 - 14:45', '14:55 - 15:40'],
  6: ['14:55 - 15:40'],
  7: ['16:00 - 16:45', '16:55 - 17:40'],
  8: ['16:55 - 17:40'],
};

Page({
  data: {
    course: null,
    loading: true,
    weekDayText: '',
    classTimeMap: CLASS_TIME_MAP
  },

  onLoad(options) {
    // 支持两种传参方式：
    // 1. 从列表页直接传整个 course 对象（JSON字符串）
    // 2. 从 URL 传 courseId 去请求详情
    if (options.courseData) {
      try {
        const course = JSON.parse(decodeURIComponent(options.courseData));
        this.setData({
          course,
          weekDayText: WEEK_DAYS[course.weekDay] || '未知',
          loading: false
        });
        wx.setNavigationBarTitle({ title: course.courseName || '课程详情' });
      } catch (e) {
        this.setData({ loading: false });
      }
    } else if (options.courseId) {
      this.fetchCourseDetail(options.courseId);
    } else {
      this.setData({ loading: false });
    }
  },

  async fetchCourseDetail(courseId) {
    const request = require('../../utils/request').default || require('../../utils/request');
    try {
      const res = await request({ url: `/course/detail/${courseId}` });
      const course = res.data;
      this.setData({
        course,
        weekDayText: WEEK_DAYS[course.weekDay] || '未知',
        loading: false
      });
      if (course.courseName) {
        wx.setNavigationBarTitle({ title: course.courseName });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});