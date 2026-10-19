// pages/grade/index.js
import request from '../../utils/request';

const SEMESTERS = ['2026-2027-1','2025-2026-2','2025-2026-1','2024-2025-2','2024-2025-1', '2023-2024-2', '2023-2024-1'];

Page({
  data: {
    semesters: SEMESTERS,
    semesterIndex: 0,
    currentSemester: SEMESTERS[0],
    viewMode: 'semester',   // 'semester' | 'all'
    grades: [],
    allSummaries: [],
    totalCredits: '0.0',
    averageGpa: '0.00',
    loading: false
  },

  onLoad() {
    this.fetchGradesBySemester();
    this.fetchAllSummaries();
  },

  onSemesterChange(e) {
    const idx = e.detail.value;
    this.setData({ semesterIndex: idx, currentSemester: SEMESTERS[idx] });
    this.fetchGradesBySemester();
  },

  setSemesterView() { this.setData({ viewMode: 'semester' }); },
  setAllView()      { this.setData({ viewMode: 'all' }); },

  async fetchGradesBySemester() {
    const { currentSemester } = this.data;
    this.setData({ loading: true, grades: [] });
    try {
      const res = await request({ url: `/grade/semester/${encodeURIComponent(currentSemester)}` });
      const grades = res.data || [];
      // 计算统计
      let totalCredits = 0, weightedGpa = 0;
      grades.forEach(g => {
        const c = parseFloat(g.credit) || 0;
        const gpa = parseFloat(g.gpa) || 0;
        totalCredits += c;
        weightedGpa += c * gpa;
      });
      const avgGpa = totalCredits > 0 ? (weightedGpa / totalCredits).toFixed(2) : '0.00';
      this.setData({
        grades,
        totalCredits: totalCredits.toFixed(1),
        averageGpa: avgGpa,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  async fetchAllSummaries() {
    try {
      const res = await request({ url: '/grade/all-semesters' });
      this.setData({ allSummaries: res.data || [] });
    } catch (err) {}
  },

  getGradeColor(score) {
    const s = parseFloat(score);
    if (s >= 90) return '#1aad19';
    if (s >= 80) return '#1677ff';
    if (s >= 70) return '#ff9500';
    if (s >= 60) return '#fa8c16';
    return '#ff4d4f';
  },

  goToDetail(e) {
    const gradeId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/grade/detail?id=${gradeId}` });
  }
});