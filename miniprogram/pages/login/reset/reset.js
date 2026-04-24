const ApiHelper = require('../../../helper/api_helper.js');

Page({
  data: {
    step: 1,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onLoad() {
    // 初始化步骤
    this.setData({
      step: 1
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [key]: e.detail.value
    });
  },

  confirmReset() {
    const { oldPassword, newPassword, confirmPassword } = this.data;

    if (!oldPassword) {
      wx.showToast({
        title: '请输入旧密码',
        icon: 'none'
      });
      return;
    }

    if (!newPassword) {
      wx.showToast({
        title: '请设置新密码',
        icon: 'none'
      });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      wx.showToast({
        title: '密码长度应在6-20位之间',
        icon: 'none'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    // 调用修改密码接口
    const params = {
      oldPassword,
      newPassword
    };

    ApiHelper.post('auth/password/reset', params).then(result => {
      if (result.code === 0) {
        // 修改成功，进入下一步
        this.setData({
          step: 2
        });
      } else {
        wx.showToast({
          title: result.message || '密码修改失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '密码修改失败，请稍后重试',
        icon: 'none'
      });
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
