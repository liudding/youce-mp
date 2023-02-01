// pages/report/report.js
Page({
  data: {
    stats: [{
      question: {
        id: "1",
        label: "1.",
        score: 2
      },
      choices: [{ label: "A", count: 0}, { label: "A", count: 10}, { label: "A", count: 20}, { label: "A", count: 20}]
    } , {
      question: {
        id: "2",
        label: "2.",
        score: 2
      },
      choices: [{ label: "A", count: 20}, { label: "B", count: 20}, { label: "C", count: 20}, { label: "D", count: 20}, { label: "E", count: 20}, { label: "F", count: 20}]
    }],

    sort: 'seq', // correct-rate
    showPopup: false,

    results: [{
      student: { name: "jjjjj", num: "123", },
      summary: {},
      score: 20,
      items: [{
        qid: "1",
        answer: "0010"
      }]
    }]
  },

  onLoad(options) {

  },
  onTapChoice(e) {
    const qi = e.currentTarget.dataset.questionindex
    const ci = e.currentTarget.dataset.choiceindex
    const data = this.data.stats[qi]
    const question = data.question
    const choice = data.choices[ci]

    if (choice.count <= 0) {
      return;
    }

    const students = []
    for (const result of this.data.results) {
      const q = result.items.find(i => i.qid == question.id)
      if (q && q.answer[ci] == "1") {
        students.push(result)
      }
    }

    this.setData({ showPopup: true, answers: students })
  },
  onTapStudent(e) {
    const answer = this.data.answers[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '/pages/answer/answer?id=' + answer.id,
    })
  },

  onTapSort() {

    this.setData({
      sort: this.data.sort === "seq" ? "correct-rate" : "seq"
    })
  },

  onShareAppMessage() {

  }
})