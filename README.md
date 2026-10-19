# 📱 Smart Campus (智慧校园) - 微信小程序前端

![WeChat](https://img.shields.io/badge/WeChat-MiniProgram-07C160?logo=wechat) 
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E) 
![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 项目简介
本项目是“智慧校园管理系统”的移动端入口，基于**微信小程序原生框架**（或填写你使用的框架，如 uni-app）开发。为在校师生提供便捷的移动端校园服务。

本项目需配合 **[Smart Campus Java 后端](https://github.com/yanwenjia911/smart-campus-backend)** 服务共同使用。

> **✨ 核心功能模块**
> * 📅 **教务查询:** 课表查看、学期成绩查询。
> * 💳 **校园卡服务:** 余额查询、在线充值、消费流水记录。
> * 🔧 **后勤报修:** 宿舍/校园设施在线报修工单提交与进度追踪。
> * 📢 **校园资讯:** 接收学校最新通知与公告。
> * 🤖 **AI 助手:** （如已接入）支持语音/文本输入的自然语言智能查询。

---

## 🛠️ 技术栈
* **开发框架:** 微信小程序原生 / [如果你用了其他框架，例如 uni-app/Taro，请替换]
* **UI 组件库:** [如 Vant Weapp / TDesign / 无则删除此行]
* **网络请求:** 封装的 `wx.request` (支持拦截器与 Token 自动注入)
* **状态管理:** [如 MobX / 内部 globalData 状态管理]

---

## 📂 工程结构概览

```text
smart-campus-wxapp
├── app.js               # 小程序全局逻辑（包含登录逻辑与 globalData）
├── app.json             # 全局路由、Window 表现与底部 TabBar 配置
├── app.wxss             # 全局样式文件
├── project.config.json  # 微信开发者工具项目配置
├── utils/               # 工具类库
│   ├── request.js       # 网络请求核心封装（包含 Token 处理与拦截器）
│   └── api.js           # 统一定义与管理所有后端 API 接口地址
├── pages/               # 小程序各个页面目录
│   ├── index/           # 首页模块
│   ├── schedule/        # 课表模块
│   ├── card/            # 校园卡模块
│   └── user/            # 个人中心模块
└── components/          # 自定义公共组件目录