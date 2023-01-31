// pages/report/report.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stats: [{
      question: {
        label: "1.",
        score: 2
      },
      answers: [{ label: "A", count: 20}, { label: "A", count: 20}, { label: "A", count: 20}, { label: "A", count: 20}]
    } , {
      question: {
        label: "1.",
        score: 2
      },
      answers: [{ label: "A", count: 20}, { label: "A", count: 20}, { label: "A", count: 20}, { label: "A", count: 20}]
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  onTapAnswer(e) {
    const qi = e.currentTarget.dataset.questionindex
    const ai = e.currentTarget.dataset.answerindex

    const question = this.data.stats[qi]
  },

  onShareAppMessage() {

  }
})