import request from '../../utils/request';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      { id: 'all', name: '全部' },
      { id: 'unread', name: '未读' }
    ],
    currentTab: 'all',
    notices: [],
    page: 1,
    pageSize: 10,
    hasMore: true, // 是否还有更多数据
    loading: false,
    refreshing: false // 是否正在下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.fetchNotices(true);
  },

  /**
   * 切换 Tab
   */
  handleTabChange(e) {
    const type = e.currentTarget.dataset.type;
    if (this.data.currentTab === type) return;

    this.setData({
      currentTab: type,
      notices: [],
      page: 1,
      hasMore: true
    }, () => {
      this.fetchNotices(true);
    });
  },

  /**
   * 获取通知列表
   * @param {boolean} isFirstPage 是否是第一页（用于刷新或切换Tab）
   */
  async fetchNotices(isFirstPage = false) {
    if (this.data.loading || (!isFirstPage && !this.data.hasMore)) return;

    const { page, pageSize, currentTab } = this.data;
    const currentPage = isFirstPage ? 1 : page;

    this.setData({ loading: true });

    try {
      // 模拟接口请求参数：类型 + 分页
      // url: `/notices?type=${currentTab}&page=${currentPage}&size=${pageSize}`
      const res = await request({ 
        url: '/notice/list',
        data: {
          type: currentTab,
          page: currentPage,
          size: pageSize
        }
      });

      const newList = res.data || [];
      
      this.setData({
        notices: isFirstPage ? newList : this.data.notices.concat(newList),
        page: currentPage + 1,
        hasMore: newList.length === pageSize,
        loading: false,
        refreshing: false
      });

      if (isFirstPage) {
        wx.stopPullDownRefresh(); // 停止下拉刷新动画
      }
    } catch (err) {
      this.setData({ loading: false, refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.fetchNotices(true);
  },

  /**
   * 页面上拉触底事件
   */
  onReachBottom() {
    if (this.data.hasMore) {
      this.fetchNotices();
    }
  },

  /**
   * 点击通知进入详情
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;

    // 1. 跳转到详情页
    wx.navigateTo({
      url: `/pages/notice/detail?id=${id}`
    });

    // 2. 前端即时修改未读状态为已读（提升用户体验，无需等待接口返回）
    const key = `notices[${index}].unread`;
    if (this.data.notices[index].unread) {
      this.setData({
        [key]: false
      });
      
      // 3. 调用后端接口标记为已读
      this.markAsRead(id);
    }
  },

  /**
   * 标记已读接口
   */
  markAsRead(id) {
    request({
      url: `/notice/read/${id}`,
      method: 'POST'
    }).catch(err => console.error('标记已读失败', err));
  }
});