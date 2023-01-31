// pages/quiz/quiz.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sheets: [{
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

  onTapForm() {
    wx.navigateTo({
      url: '/pages/form/form',
    })
  },

  onShareAppMessage() {

  }
})