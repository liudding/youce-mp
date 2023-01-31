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
      answers: [{ label: "A", count: 20}, { label: "B", count: 20}, { label: "C", count: 20}, { label: "D", count: 20}, { label: "E", count: 20}, { label: "F", count: 20}]
    }],

    sort: 'seq' // correct-rate
  },

  onLoad(options) {

  },
  onTapAnswer(e) {
    const qi = e.currentTarget.dataset.questionindex
    const ai = e.currentTarget.dataset.answerindex

    const question = this.data.stats[qi]
  },

  onTapSort() {

    this.setData({
      sort: this.data.sort === "seq" ? "correct-rate" : "seq"
    })
  },

  onShareAppMessage() {

  }
})