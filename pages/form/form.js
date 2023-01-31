// pages/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [{
      label: "1",
      bubbles: [0, 1, 0,0,0],
      score: 1
    }, {
      label: "1",
      bubbles: [0, 0, 1,0,0],
      score: 1
    }, {
      label: "1",
      bubbles: [0, 1, 0,0,0],
      score: 1
    }]
  },


  onLoad(options) {

  },

  onTapAdd() {
    
  },

  onShareAppMessage() {

  }
})