import request from '../../utils/request';

// 节次与具体时间的映射表
const CLASS_TIME_MAP = {
  1: { start: '08:00', end: '08:50' },
  2: { start: '09:00', end: '09:50' },
  3: { start: '10:00', end: '10:50' },
  4: { start: '11:00', end: '12:50' },
  5: { start: '14:30', end: '15:20' },
  6: { start: '15:30', end: '16:20' },
  7: { start: '16:30', end: '17:20' },
  8: { start: '17:30', end: '18:20' },
  9: { start: '19:00', end: '19:50' },
  10: { start: '20:00', end: '20:50' },
  11: { start: '21:00', end: '21:50' }
};

const WEEKS = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 周`);

Page({
  data: {
    semesterStartDate: '2026/09/01', // 🎯 【关键1】必须放在 data 里面，并且一定要用斜杠！
    weeks: WEEKS,
    weekIndex: 0, 
    currentWeek: 1,
    currentSemester: '2026-2027-1', 

    viewMode: 'day',    
    selectedDay: 0,     
    weekDays: [],       
    
    courses: [],        
    weekSchedule: [],   
    
    todayCourseCount: 0,
    nextCourseTime: '--:--',
    totalWeekHours: 0,
    loading: false
  },

  onLoad() {
    this.initCalendar();
    this.fetchScheduleData();
  },

  // 1. 初始化日期导航 (安全加强版)
  initCalendar(targetWeek = null) {
    // 🎯 【关键2】正确读取 data 里的开学日期
    const startDateStr = this.data.semesterStartDate || '2026/09/01';
    // 强制转斜杠，防苹果 iOS 闪退
    const safeDateStr = startDateStr.replace(/-/g, '/'); 
    
    const startDate = new Date(safeDateStr);
    const now = new Date();

    let activeWeek = targetWeek;
    if (!activeWeek) {
      const diffTime = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (24 * 3600 * 1000));
      activeWeek = Math.max(1, Math.ceil((diffDays + 1) / 7));
    }

    const offsetDays = (activeWeek - 1) * 7;
    const targetMonday = new Date(startDate.getTime() + offsetDays * 24 * 3600 * 1000);

    const weekDays = ['一', '二', '三', '四', '五', '六', '日'].map((label, i) => {
      const d = new Date(targetMonday.getTime() + i * 24 * 3600 * 1000);
      
      const month = d.getMonth() + 1;
      const day = d.getDate();
      
      return {
        label: label,
        date: `${month}/${day}`,
        // 🎯 【关键3】彻底抛弃 toISOString()，纯手工安全拼接！
        fullDate: `${d.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      };
    });

    const isCurrentPhysicalWeek = !targetWeek || targetWeek === this.data.currentWeek;
    const dayOfWeek = now.getDay() || 7; 

    this.setData({ 
      weekDays,
      currentWeek: activeWeek,    
      weekIndex: activeWeek - 1,  
      selectedDay: isCurrentPhysicalWeek ? (dayOfWeek - 1) : 0 
    });
  },

  // 2. 切换周次时触发
  onWeekChange(e) {
    const idx = parseInt(e.detail.value);
    const selectedWeek = idx + 1; // picker 是从 0 开始的，加上 1 就是真实周次

    // 🎯 关键：把用户选的周次传进去，重新计算那 7 天的日期！
    this.initCalendar(selectedWeek);

    // 重新拉取新一周的课表数据
    this.fetchScheduleData();
  },

  // 3. 切换视图与日期选择
  setDayView() { this.setData({ viewMode: 'day' }); },
  setWeekView() { this.setData({ viewMode: 'week' }); },
  
  onDaySelect(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ selectedDay: idx });
    this.updateDailyList(); // 切换日期时重新筛选当日课程
  },

  // 4. 获取课表数据 (【终极版：全地形数组探测器】)
  async fetchScheduleData() {
    const { currentSemester } = this.data;
    this.setData({ loading: true });
    
    try {
      const res = await request({ 
        url: `/course/weekly/${currentSemester}` 
      });
      
      console.log("👉 [后端返回的原始课表数据]:", res);

      // 🎯 核心修复 1：终极智能数组提取！
      let rawList = [];
      // 瞄准靶心：直接锁定 weeklyCourses
      const targetObj = (res.data && res.data.weeklyCourses) ? res.data.weeklyCourses : res.data;

      if (Array.isArray(targetObj)) {
        rawList = targetObj; // 如果它直接就是数组
      } else if (targetObj && typeof targetObj === 'object') {
        // 情况 A：如果是 VO 对象，去找它里面的常见数组字段
        if (Array.isArray(targetObj.courseList)) rawList = targetObj.courseList;
        else if (Array.isArray(targetObj.courses)) rawList = targetObj.courses;
        else if (Array.isArray(targetObj.list)) rawList = targetObj.list;
        else {
          // 情况 B：如果是按天分组的 Map (比如 {"1": [...], "2": [...]})，把它们全拼起来！
          Object.values(targetObj).forEach(val => {
            if (Array.isArray(val)) {
              rawList = rawList.concat(val);
            }
          });
        }
      }

      // 如果还是空的，给个终极提示
      if (rawList.length === 0) {
        console.warn("⚠️ 依然找不到数组！请在控制台点开 weeklyCourses 的 {...}，看看里面的数组到底叫什么名字！");
      }

      // 🎯 核心翻译逻辑：把后端的字段翻译成 WXML 认识的字段
      const formattedData = rawList.map(course => {
        const startP = course.startClass || course.start_class; 
        const count = course.period || 1;
        
        const timeInfo = CLASS_TIME_MAP[startP];
        const endP = startP + count - 1;
        const endTimeInfo = CLASS_TIME_MAP[endP];

        return {
          ...course,
          courseName: course.courseName || course.course_name,
          teacherName: course.teacherName || course.teacher_name,
          weekRange: course.weekRange || course.week_range,
          dayOfWeek: Number(course.weekDay || course.week_day), 
          startTime: timeInfo ? timeInfo.start : '00:00',
          endTime: endTimeInfo ? endTimeInfo.end : '00:00'
        };
      });

      this.setData({ 
        allRawData: formattedData,
        loading: false 
      }, () => {
        this.updateDailyList();
        this.calculateWeekStats(formattedData);
      });

    } catch (err) {
      console.error("获取课表失败", err);
      this.setData({ loading: false });
    }
  },

  // 5. 过滤当日课程 (【核心修复：加入时间穿越感知】)
  updateDailyList() {
    const { allRawData, selectedDay, currentWeek, weekDays } = this.data;
    // 如果没有数据，或者连日期导航还没初始化好，直接拦截
    if (!allRawData || !Array.isArray(allRawData) || !weekDays || weekDays.length === 0) return;

    // 1. 获取物理世界的“今天”和“现在几点”
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const nowTimeStr = now.toTimeString().substring(0, 5);

    // 2. 获取用户当前点击的“目标日期”
    const targetDayData = weekDays[selectedDay];
    const targetDate = targetDayData ? targetDayData.fullDate : todayDate;

    // 3. 过滤出这天该上的课
    const dailyCourses = allRawData.filter(c => {
      const isDayMatch = c.dayOfWeek === (selectedDay + 1);
      let isWeekMatch = true; 
      if (c.weekRange) {
        const parts = String(c.weekRange).split('-');
        if (parts.length === 2) {
          const startW = parseInt(parts[0]);
          const endW = parseInt(parts[1]);
          if (currentWeek < startW || currentWeek > endW) isWeekMatch = false;
        }
      }
      return isDayMatch && isWeekMatch;
    });
    
    // 4. 按开始时间先后排序
    dailyCourses.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });

    // 5. 🔮 核心状态计算：判断这天是过去、现在还是未来
    let nextTimeDisplay = '--:--';

    dailyCourses.forEach(c => {
      if (targetDate < todayDate) {
        // 🔙 看过去：这天的课全上完了，卡片变灰
        c.isFinished = true;
        c.isCurrent = false;
      } else if (targetDate > todayDate) {
        // 🔜 看未来：全是还没上的课
        c.isFinished = false;
        c.isCurrent = false;
      } else {
        // ⬇️ 看今天：严格根据当前几点钟判断
        c.isFinished = c.endTime && c.endTime <= nowTimeStr;
        // 顺便算一下此刻是不是正在上这节课（点亮“上课中”徽章）
        c.isCurrent = c.startTime <= nowTimeStr && c.endTime > nowTimeStr;
      }
    });

    // 6. 计算顶部统计栏的“下一节课”文字
    if (dailyCourses.length === 0) {
      nextTimeDisplay = '全天无课';
    } else if (targetDate < todayDate) {
      nextTimeDisplay = '已结束'; // 过去的日子
    } else if (targetDate > todayDate) {
      nextTimeDisplay = dailyCourses[0].startTime; // 未来的日子，下一节就是当天的第一节
    } else {
      // 今天的日子，找第一节还没结束的课
      const next = dailyCourses.find(c => !c.isFinished);
      nextTimeDisplay = next ? next.startTime : '今日已结课';
    }

    // 7. 更新到页面
    this.setData({
      courses: dailyCourses,
      todayCourseCount: dailyCourses.length,
      nextCourseTime: nextTimeDisplay
    });
  },

  // 6. 重新计算统计信息 (基于当前真实周次)
  calculateWeekStats(data) {
    if (!Array.isArray(data)) return;
    const { currentWeek } = this.data;
    
    // 过滤出本周真实存在的课
    const validWeekData = data.filter(c => {
      if (!c.weekRange) return true;
      const parts = String(c.weekRange).split('-');
      if (parts.length === 2) {
        return currentWeek >= parseInt(parts[0]) && currentWeek <= parseInt(parts[1]);
      }
      return true;
    });

    let totalHours = validWeekData.length * 2;

    const weekSchedule = ['一', '二', '三', '四', '五', '六', '日'].map((label, i) => ({
      dayLabel: `周${label}`,
      list: validWeekData.filter(c => c.dayOfWeek === (i + 1))
    }));

    this.setData({ 
      totalWeekHours: totalHours,
      weekSchedule 
    });
  },

  // 跳转详情
  goToCourseDetail(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/course/detail?id=${courseId}` });
  }
});