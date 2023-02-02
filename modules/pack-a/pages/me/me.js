const app = getApp()

const constant = require('../../../../utils/constant')

Page({

  data: {
    apps: [{
      appId: 'wx9ca5d608dc08fa4e',
      name: '礼金份子钱记账',
      logo: '../../../../images/fenziqian.png'
    }, 
    // {
    //   appId: 'wx6f0c5ff8030a44eb',
    //   name: '易卡包',
    //   logo: '../../../../images/cardllet.png'
    // }, 
    // {
    //   appId: 'wx49ddf9db7be1dec0',
    //   name: '古诗起名',
    //   logo: '../../../../images/poem.png'
    // },
     {
      appId: 'wx492e00ba65d2d13c',
      name: '文件解压缩',
      logo: '../../../../images/zeep.png'
    }],
    showProfile: true,
    showPinPrompt: false,

    logoClicks: 0
  },

  onLoad: function (options) {

  },

  onTapLogo() {
    this.data.logoClicks ++;

    this.timer && clearTimeout(this.timer)

    if (this.data.logoClicks >= 5) {
      wx.setStorageSync(constant.STORAGE_KEY__CONTENT_CHECK_ENABLED, false)
    }

    this.timer = setTimeout(() => {
      this.data.logoClicks = 0;
      console.log('clear')
    }, 1000);

  },

  onTapPin() {
    this.setData({
      showPinPrompt: false
    })
    this.setData({
      showPinPrompt: true
    })
  },

  onTapHelp() {
    wx.navigateTo({
      url: '/packageA/pages/me/help/help',
    })
  },

  onTapFeedback() {
    const sysInfo = wx.getSystemInfoSync()

    const clientData = {
      sdk: sysInfo.SDKVersion,
      brand: sysInfo.brand,
      deviceOrientation: sysInfo.deviceOrientation,
      devicePixelRatio: sysInfo.devicePixelRatio,
      fontSizeSetting: sysInfo.fontSizeSetting,
      model: sysInfo.model,
      platform: sysInfo.platform,
      system: sysInfo.system,
      version: sysInfo.version
    };

    const customData = {
      clientInfo: `${sysInfo.model} ${sysInfo.platform} ${sysInfo.SDKVersion}`,
      clientVersion: sysInfo.version,
      os: sysInfo.system,
      // customInfo: ''
    };

    console.log(wx.getSystemInfoSync())

    
    if (wx.openEmbeddedMiniProgram) {
      wx.openEmbeddedMiniProgram({
        appId: "wx8abaf00ee8c3202e",
        extraData: {
          id: "361836",
          customData
        }
      })
    } else {
      wx.navigateToMiniProgram({
        appId: 'wx8abaf00ee8c3202e',
        extraData: {
          id: "361836",
          customData
        },
      })
    }




  },

  onTapApp(e) {
    const index = e.currentTarget.dataset.index
    const app = this.data.apps[index];

    wx.navigateToMiniProgram({
      appId: app.appId
    })
  },

  onShareAppMessage: function () {

  },
  onShareTimeline: function () {

  },

  onAddToFavorites: function () {

  }
})