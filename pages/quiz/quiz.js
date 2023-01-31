// pages/quiz/quiz.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    answers: [{
      name: 'jack',
      num: "12345",
      score: 122
    }, {
      name: 'jack',
      score: 122
    }],
    stats: {
      questionCount: 32
    }
  },

  onLoad(options) {

  },

  onTapReport() {
    wx.navigateTo({
      url: '/pages/report/report',
    })
  },

  onTapExport() {
    let content = "";
    for (const answer of this.data.answers) {
      content += [answer.name, answer.num, answer.score].join(",")
    }

    const fs = wx.getFileSystemManager()
    fs.writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/hello.csv`,
      data: content,
      success: (res) => {
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  onTapForm() {
    wx.navigateTo({
      url: '/pages/form/form',
    })
  },

  onTapAnswer(e) {
    const answer = this.data.answers[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '/pages/answer/answer?id=' + answer.id,
    })
  },

  onShareAppMessage() {

  }
})