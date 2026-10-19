Page({
  data: {
    inputValue: '',       // 输入框的内容
    messageList: [],      // 聊天记录数组，格式: [{ role: 'user'/'ai', content: '...' }]
    isThinking: false,    // 控制 AI 思考时的 loading 状态
    
    // 💡 优化：优先从缓存获取真实学号，如果没有再回退到测试用的 '1001'
    userId: wx.getStorageSync('student_id') || '1001' 
  },

  // 监听输入框变化
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 点击发送按钮
  sendMessage() {
    const text = this.data.inputValue.trim();
    if (!text || this.data.isThinking) return;

    // 1. 将用户的提问加入聊天列表，清空输入框，开启 loading
    const newMessages = [...this.data.messageList, { role: 'user', content: text }];
    this.setData({
      messageList: newMessages,
      inputValue: '',
      isThinking: true
    });

    // 🎯 核心新增：从本地缓存拿到真实 Token
    // 注意：这里的 'token' 请确保和你小程序登录成功后 wx.setStorageSync 保存的键名一致
    const realToken = wx.getStorageSync('token') || ''; 

    // 2. 发起网络请求调用你的 Python FastAPI 接口
    wx.request({
      // 注意端口已经是 8081
      url: 'http://127.0.0.1:8081/api/chat', 
      method: 'POST',
      
      // 🎯 核心新增：在请求头中携带 Token 传给 Python
      header: {
        'Authorization': 'Bearer ' + realToken, 
        'content-type': 'application/json' 
      },
      
      data: {
        user_id: this.data.userId,
        user_message: text
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          // 3. 将 AI 的回复追加到聊天列表
          this.setData({
            messageList: [...this.data.messageList, { role: 'ai', content: res.data.reply }]
          });
        } else {
          wx.showToast({ title: 'AI 引擎接口异常', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        console.error("请求报错:", err);
      },
      complete: () => {
        // 4. 无论成功失败，关闭 loading 状态
        this.setData({ isThinking: false });
      }
    });
  }
});