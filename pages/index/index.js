// pages/index/index.js
import request from '../../utils/request';

const DAYS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

Page({
  data: {
    greeting: '',
    dateText: '',
    topNotices: [],
    latestNotices: [],
    noticeLoading: true
  },

  onLoad() {
    // 登录守卫：未登录跳转到 auth 页
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.reLaunch({ url: '/pages/auth/index' });
      return;
    }
    this.initGreeting();
    this.fetchNotices();
  },

  onShow() {
    // 每次显示时刷新问候语（时间变化）
    this.initGreeting();
  },

  initGreeting() {
    const user = wx.getStorageSync('userInfo');
    const now = new Date();
    const hour = now.getHours();
    let prefix = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
    const name = user ? user.nickname || '同学' : '同学';
    
    const month = MONTHS[now.getMonth()];
    const day = now.getDate();
    const weekDay = DAYS[now.getDay() === 0 ? 7 : now.getDay()];
    
    this.setData({
      greeting: `${prefix}，${name}！`,
      dateText: `${month}${day}日 ${weekDay}`
    });
  },

  async fetchNotices() {
    this.setData({ noticeLoading: true });
    try {
      // 并发请求置顶通知 & 最新通知
      const [topRes, latestRes] = await Promise.all([
        request({ url: '/notice/top' }),
        request({ url: '/notice/latest?limit=5' })
      ]);
      this.setData({
        topNotices: topRes.data || [],
        latestNotices: latestRes.data || [],
        noticeLoading: false
      });
    } catch (err) {
      this.setData({ noticeLoading: false });
    }
  },

  goToNoticeDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/notice/detail?id=${id}` });
  },

  goToNotice() {
    wx.navigateTo({ url: '/pages/notice/index' });
  },

  goToCourse() {
    wx.switchTab({ url: '/pages/course/index' });
  },

  goToGrade() {
    wx.navigateTo({ url: '/pages/grade/index' });
  },

  goToCard() {
    wx.navigateTo({ url: '/pages/card/index' });
  },

  goToRepair() {
    wx.navigateTo({ url: '/pages/repair/index' });
  },

  // 新增：跳转到 AI 助手页面
  goToChat() {
    wx.navigateTo({
      url: '/pages/chat/chat', // 确保这里的路径和你 app.json 里配置的一致
      success: function(res) {},
      fail: function(err) {
        console.error("跳转失败:", err);
      }
    })
  }
});