// pages/repair/index.js
import request from '../../utils/request';

const STATUS_LABELS = {
  SUBMITTED:  '待处理',
  ASSIGNED:   '已派单',
  IN_PROGRESS:'处理中',
  COMPLETED:  '已完成',
  CANCELLED:  '已取消'
};

Page({
  data: {
    currentTab: 'submit',
    categories: ['水电', '家具', '网络', '空调', '门窗', '其他'],
    catIcons: ['💧', '🪑', '📶', '❄️', '🚪', '🔧'],
    selectedCategory: '其他',
    form: {
      title: '',
      repairLocation: '',
      contactPhone: '',
      description: '',
      category: '其他'
    },
    submitting: false,
    // 我的工单
    myTickets: [],
    ticketsLoading: false,
    filterStatus: '',
    statusLabels: STATUS_LABELS
  },

  onLoad() {
    // 预填联系电话（从用户信息获取）
    const user = wx.getStorageSync('userInfo');
    if (user && user.phone) {
      this.setData({ 'form.contactPhone': user.phone });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'myTickets') {
      this.loadMyTickets();
    }
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ selectedCategory: cat, 'form.category': cat });
  },

  onTitleInput(e)    { this.setData({ 'form.title': e.detail.value }); },
  onLocationInput(e) { this.setData({ 'form.repairLocation': e.detail.value }); },
  onPhoneInput(e)    { this.setData({ 'form.contactPhone': e.detail.value }); },
  onDescInput(e)     { this.setData({ 'form.description': e.detail.value }); },

  async submitRepair() {
    const { form } = this.data;
    // 表单校验
    if (!form.title.trim()) { wx.showToast({ title: '请输入问题标题', icon: 'none' }); return; }
    if (!form.repairLocation.trim()) { wx.showToast({ title: '请输入报修地点', icon: 'none' }); return; }
    if (!form.contactPhone.trim()) { wx.showToast({ title: '请输入联系电话', icon: 'none' }); return; }
    if (form.contactPhone.length < 11) { wx.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }

    this.setData({ submitting: true });
    try {
      const res = await request({
        url: '/repair/submit',
        method: 'POST',
        data: {
          title: form.title.trim(),
          repairLocation: form.repairLocation.trim(),
          contactPhone: form.contactPhone.trim(),
          description: form.description.trim(),
          category: form.category
        }
      });
      wx.showToast({ title: '报修提交成功！', icon: 'success' });
      // 重置表单
      this.setData({
        form: { title: '', repairLocation: '', contactPhone: '', description: '', category: '其他' },
        selectedCategory: '其他'
      });
      // 跳转到我的工单
      setTimeout(() => {
        this.setData({ currentTab: 'myTickets' });
        this.loadMyTickets();
      }, 1200);
    } catch {
      // 错误已由 request.js 处理
    } finally {
      this.setData({ submitting: false });
    }
  },

  async loadMyTickets() {
    const { filterStatus } = this.data;
    this.setData({ ticketsLoading: true });
    try {
      const statusParam = filterStatus ? `?status=${filterStatus}` : '';
      const res = await request({ url: `/repair/my-tickets${statusParam}` });
      this.setData({ myTickets: res.data || [], ticketsLoading: false });
    } catch {
      this.setData({ ticketsLoading: false });
    }
  },

  filterTickets(e) {
    this.setData({ filterStatus: e.currentTarget.dataset.status });
    this.loadMyTickets();
  }
});
