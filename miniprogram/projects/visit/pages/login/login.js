const PassportBiz = require('../../../../comm/biz/passport_biz.js');
const cloudHelper = require('../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../helper/page_helper.js');

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

    const params = {
      username,
      password
    };

    const opt = {
      title: '登录中'
    };

    cloudHelper.callCloudSumbit('passport/passwordLogin', params, opt).then(result => {
      if (result && result.data && result.data.token) {
        PassportBiz.setToken(result.data.token);
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.reLaunch({
            url: pageHelper.fmtURLByPID('/projects/visit/pages/default/index/default_index')
          });
        }, 1000);
      } else {
        wx.showToast({
          title: '登录失败，请检查账号密码',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      });
    });
  },

  goToReset() {
    wx.navigateTo({
      url: '/projects/visit/pages/login/reset/reset'
    });
  }
});
