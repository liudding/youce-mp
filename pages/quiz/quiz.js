// pages/quiz/quiz.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    quiz: {
      id: "sss",
      title: 'Quiz #1'
    },
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
    // TODO: 如果是第一次导出，则提示需要将文件转发给自己或者文件传输助手
    let content = "";
    for (const answer of this.data.answers) {
      content += [answer.name, answer.num, answer.score].join(",")
    }

    const filepath =  `${wx.env.USER_DATA_PATH}/${this.data.quiz.id}.csv`
    const filename = this.data.quiz.title + "成绩表.csv"

    const fs = wx.getFileSystemManager()
    fs.writeFile({
      filePath: filepath,
      data: content,
      success: (res) => {
        console.log(res)
        wx.shareFileMessage({
          filePath: filepath,
          fileName: filename
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  onTapSheet() {
    wx.navigateTo({
      url: '/pages/sheet/sheet',
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