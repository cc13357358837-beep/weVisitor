const PassportBiz = require('../../comm/biz/passport_biz.js');
const ApiHelper = require('../../helper/api_helper.js');
const pageHelper = require('../../helper/page_helper.js');

Page({
  data: {
    username: '',
    password: ''
  },

  onLoad(options) {
    // 检查是否已登录，如果已登录则跳转到首页
    if (PassportBiz.isLogin()) {
      wx.reLaunch({
        url: pageHelper.fmtURLByPID('/projects/visit/pages/default/index/default_index')
      });
    }
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [key]: e.detail.value
    });
  },

  login() {
    const { username, password } = this.data;

    if (!username) {
      wx.showToast({
        title: '请输入用户名/手机号',
        icon: 'none'
      });
      return;
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    ApiHelper.post('auth/login', {
      username,
      password
    }, {
      loadingText: '登录中'
    }).then(data => {
      console.log(data, "res");
      console.log(typeof data.data.token, "token type");
      console.log(data.data.token, "token value");
      if (data.code === 200 && data.data && data.data.token) {
        // 确保 token 是字符串
        const token = typeof data.data.token === 'string' ? data.data.token : JSON.stringify(data.data.token);
        PassportBiz.setToken(token);
        console.log('Token stored:', token);
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        wx.reLaunch({
          url: '/projects/visit/pages/default/index/default_index'
        });
      } else {
        wx.showToast({
          title: '登录失败，请检查账号密码',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      // ApiHelper 已经处理了错误提示
    });
  },

  goToReset() {
    wx.navigateTo({
      url: '/pages/login/reset/reset'
    });
  }
});
