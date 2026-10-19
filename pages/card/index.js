// pages/card/index.js
import request from '../../utils/request';

Page({
  data: {
    cardInfo: {},
    transactions: [],
    loading: true,
    // 充值
    showRechargeModal: false,
    rechargeOptions: [10, 20, 50, 100, 200, 500],
    selectedAmount: 50,
    customAmount: '',
    recharging: false
  },

  onLoad() {
    this.loadCardInfo();
  },

  onShow() {
    this.loadCardInfo();
  },

  async loadCardInfo() {
    this.setData({ loading: true });
    try {
      const [cardRes, txRes] = await Promise.all([
        request({ url: '/card/info' }),
        request({ url: '/card/transactions?page=1&size=20' })
      ]);
      this.setData({
        cardInfo: cardRes.data || {},
        transactions: txRes.data || [],
        loading: false
      });
    } catch {
      this.setData({ loading: false });
    }
  },

  showRecharge() {
    if (this.data.cardInfo.status === 'LOST') {
      wx.showToast({ title: '卡已挂失，不能充值', icon: 'none' });
      return;
    }
    this.setData({ showRechargeModal: true });
  },

  closeModal() {
    this.setData({ showRechargeModal: false, customAmount: '' });
  },

  selectAmount(e) {
    this.setData({ selectedAmount: e.currentTarget.dataset.amount, customAmount: '' });
  },

  onCustomAmountInput(e) {
    this.setData({ customAmount: e.detail.value, selectedAmount: null });
  },

  async confirmRecharge() {
    const { cardInfo, selectedAmount, customAmount } = this.data;
    const amount = parseFloat(customAmount) || selectedAmount;
    if (!amount || amount <= 0) {
      wx.showToast({ title: '请选择或输入充值金额', icon: 'none' }); return;
    }
    this.setData({ recharging: true });
    try {
      await request({
        url: '/card/recharge',
        method: 'POST',
        data: { cardId: cardInfo.id, amount }
      });
      wx.showToast({ title: `充值 ¥${amount} 成功！`, icon: 'success' });
      this.closeModal();
      this.loadCardInfo(); // 刷新余额
    } catch {
    } finally {
      this.setData({ recharging: false });
    }
  },

  async handleReportLost() {
    const { cardInfo } = this.data;
    const isLost = cardInfo.status === 'LOST';

    wx.showModal({
      title: isLost ? '申请解挂' : '校园卡挂失',
      content: isLost
        ? '确认解除挂失状态，恢复卡片正常使用？'
        : '确认挂失校园卡？挂失后将无法使用，请尽快办理解挂或补卡。',
      confirmText: isLost ? '确认解挂' : '确认挂失',
      confirmColor: isLost ? '#1aad19' : '#ff4d4f',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          if (isLost) {
            await request({ url: `/card/unreport-lost?cardId=${cardInfo.id}`, method: 'POST' });
            wx.showToast({ title: '解挂成功', icon: 'success' });
          } else {
            await request({ url: `/card/report-lost?cardId=${cardInfo.id}`, method: 'POST' });
            wx.showToast({ title: '挂失成功', icon: 'success' });
          }
          this.loadCardInfo();
        } catch {}
      }
    });
  }
});
