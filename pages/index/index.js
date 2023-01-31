// index.js
// 获取应用实例
const app = getApp()

import { clone} from '../../utils/util'

Page({
  data: {
    quizzes: [{
      title: 'haaksd',
      date: '2022-01-01'
    }, {
      title: 'haaksd',
      date: '2022-02-01'
    }],
    showActionsheet: false,
    actions: [{ text: '编辑', value: "edit" },
    { text: '复制', value: "copy" },
    { text: '删除', type: 'warn', value: "delete" }],

    showEditPopup: false,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onTappAdd() {
    this.showEditForm()
  },
  onTapQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/quiz'
    })
  },
  onTapMore(e) {
    const index = e.currentTarget.dataset.index

    this.currentQuizIndex = index

    this.setData({
      showActionsheet: true
    })
  },
  onActionTapped(e) {
    const quiz = this.data.quizzes[this.currentQuizIndex]
    const action = e.detail.value
    this.closeActionSheet()
    if (action === "edit") {
      this.showEditForm(quiz)
      return
    }

    if (action === "copy") {
      this.copyQuiz(quiz)
      return
    }

    if (action === "delete") {
      wx.showModal({
        title: '是否确认删除',
        content: '删除之后无法恢复，请谨慎删除',
        complete: (res) => {
          if (res.confirm) {
            this.deleteQuiz(quiz)
          }
        }
      })
    }
  },

  onFormSubmit(e) {
    this.createQuiz({
      title: e.detail.value.title
    })
  },

  closeActionSheet() {
    this.setData({
      showActionsheet: false
    })
    this.currentQuizIndex = null;
  },
  showEditForm(quiz = null) {
    this.setData({ 
      showEditPopup: true, 
      focusForm: false,
      form: {
        title: quiz ? quiz.title : ""
      }
    })
    setTimeout(() => {
      this.setData({ focusForm: true})
    }, 400)
  },

  createQuiz(quiz) {
    this.data.quizzes.unshift(quiz)
    this.setData({ quizzes: this.data.quizzes})
  },
  copyQuiz(quiz) {
    const q = clone(quiz)
    q.id ++
    q.title = q.title + "(复制)"
    // q.date = 

    this.data.quizzes.unshift(q)
    this.setData({
      quizzes: this.data.quizzes
    })
  },
  deleteQuiz(quiz) {
    const index = this.data.quizzes.findIndex(i => i.id == quiz.id)
    this.data.quizzes.splice(index, 1)
    this.setData({
      quizzes: this.data.quizzes
    })
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
