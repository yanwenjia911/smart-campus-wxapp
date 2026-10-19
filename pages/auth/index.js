// pages/auth/index.js
import request from '../../utils/request';

Page({
  data: {
    isFirstLogin: false,  // 是否显示绑定表单
    studentId: '',
    name: '',
    loading: false
  },

  onLoad() {
    // 已有 token 则直接跳首页 (改用 reLaunch 万能跳转)
    const token = wx.getStorageSync('token');
    if (token) {
      wx.reLaunch({ 
        url: '/pages/index/index',
        fail: (err) => console.error("跳首页失败，请检查路径:", err)
      });
    }
  },

  onStudentIdInput(e) {
    this.setData({ studentId: e.detail.value });
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  /**
   * 1. 微信一键登录
   */
  async handleWxLogin() {
    this.setData({ loading: true });
    
    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });

      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { code: loginRes.code }
      });

      if (res && res.token) {
        wx.setStorageSync('token', res.token);

        // 存 userInfo (用于前端个人中心展示)
        wx.setStorageSync('userInfo', {
          name: res.data.nickname, // 把 nickname 转成前端常用的 name 字段
          role: res.data.role
        });

        wx.showToast({ title: '登录成功', icon: 'success' });
        
        // 👇 改用 reLaunch，并增加失败回调
        setTimeout(() => {
          wx.reLaunch({ 
            url: '/pages/index/index',
            fail: (err) => {
              console.error("跳转失败:", err);
              wx.showToast({ title: '页面路径错误', icon: 'error' });
            }
          });
        }, 800);
      } else {
        this.setData({ 
          isFirstLogin: true, 
          _wxCode: loginRes.code 
        });
        wx.showToast({ title: '请先绑定学号', icon: 'none' });
      }

    } catch (err) {
      console.log("捕获到后端异常:", err);
      const errMsg = err.message || err.error || (typeof err === 'string' ? err : JSON.stringify(err));

      console.log(" [前端调试] 提取出的字符串:", errMsg);
      
      if (err && err.status === 500) {
        this.setData({ isFirstLogin: true });
        wx.showToast({ title: '请先绑定学号', icon: 'none' });
      } else {
        console.error("微信登录异常", err);
        wx.showToast({ title: '服务器异常，登录失败', icon: 'none' });
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 2. 首次绑定学号
   */
  async handleBind() {
    const { studentId, name } = this.data;
    
    if (!studentId.trim() || !name.trim()) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' }); 
      return;
    }

    this.setData({ loading: true });

    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject });
      });

      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { 
          code: loginRes.code,
          studentId: studentId.trim(),
          name: name.trim()
        }
      });
      
      console.log("[后端返回的真实数据]:", res);

      // Token 提取
      const actualToken = res.token || 
                          (res.data && res.data.token) || 
                          (res.data && res.data.data && res.data.data.token);

      if (res && res.data && res.data.token) {
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userInfo', {
          name: res.data.nickname, // 把 nickname 转成前端常用的 name 字段
          role: res.data.role
        });

        wx.showToast({ title: '绑定成功', icon: 'success' });
        
        //  改用 reLaunch，并增加失败回调
        setTimeout(() => {
          wx.reLaunch({ 
            url: '/pages/index/index',
            fail: (err) => {
              console.error("跳转失败:", err);
              wx.showToast({ title: '页面路径错误', icon: 'error' });
            }
          });
        }, 800);
      }
    } catch (err) {
      console.error('绑定失败', err);
    } finally {
      this.setData({ loading: false });
    }
  }
});