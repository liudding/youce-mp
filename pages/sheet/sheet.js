// pages/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [{
      label: "1",
      bubbles: "0100",
      score: 1
    }, {
      label: "2",
      bubbles: "1000",
      score: 1
    }, {
      label: "3",
      bubbles: "0011",
      score: 1
    }],

    showPopup: false,
    form: {}
  },

  onLoad(options) {

  },

  onTapBubble(e) {
    const qindex = e.currentTarget.dataset.questionindex
    const question = this.data.questions[qindex]
    const bindex = e.currentTarget.dataset.bubbleindex;
    const bubble = +question.bubbles[bindex]
    
    question.bubbles = question.bubbles.substring(0, bindex) + (!bubble) + question.bubbles.substring(bindex + 1)
    
    this.setData({
      [`questions[${qindex}].bubbles`]: question.bubbles
    })
  },
  onTapLabel(e) {
    const question = this.data.questions[e.currentTarget.dataset.index]
    
    this.setData({
      showPopup: true,
      form: {
        label: question.label,
        type: question.type,
        score: question.score
      }
    })
  },

  onTapScore(e) {
    const question = this.data.questions[e.currentTarget.dataset.index]
  },

  onLongPressQuestion(e) {
    wx.showActionSheet({
      alertText: "是否删除",
      itemList: ["删除", "取消"],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteQuestion(e.currentTarget.dataset.index)
        }
      },
    })
  },

  onTapAdd() {
    const last = this.data.questions[this.data.questions.length - 1] || { label: 0, bubbles: [0, 0, 0, 0], score: 1}
    const choices = last.bubbles.map(i => 0)

    const question = {
      label: +last.label + 1,
      score: last.score,
      bubbles: choices
    }

    this.data.questions.push(question)
    this.setData({questions: this.data.questions})
  },

  onFormSubmit(e) {
    console.log(e)
  },

  deleteQuestion(index) {
    // const index = this.data.questions
    console.log(index)
    this.data.questions.splice(index, 1)
    this.setData({
      questions: this.data.questions
    })
  },

  saveForm() {

  },

  onShareAppMessage() {

  }
})