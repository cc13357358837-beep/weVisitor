const cloudHelper = require('../../../helper/cloud_helper.js');

Page({
  data: {
    step: 1,
    mobile: '',
    code: '',
    password: '',
    confirmPassword: '',
    countdown: 0
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

  getCode() {
    const { mobile } = this.data;

    if (!mobile) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    if (mobile.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 调用云函数获取验证码
    const params = {
      mobile
    };

    const opt = {
      title: '发送验证码中'
    };

    cloudHelper.callCloudSumbit('passport/sendCode', params, opt).then(result => {
      if (result && result.data && result.data.success) {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success'
        });
        // 开始倒计时
        this.startCountdown();
      } else {
        wx.showToast({
          title: '验证码发送失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '验证码发送失败',
        icon: 'none'
      });
    });
  },

  startCountdown() {
    let countdown = 60;
    this.setData({
      countdown
    });

    const timer = setInterval(() => {
      countdown--;
      this.setData({
        countdown
      });

      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  },

  nextStep() {
    const { mobile, code } = this.data;

    if (!mobile) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    // 验证验证码
    const params = {
      mobile,
      code
    };

    const opt = {
      title: '验证中'
    };

    cloudHelper.callCloudSumbit('passport/verifyCode', params, opt).then(result => {
      if (result && result.data && result.data.success) {
        // 验证成功，进入下一步
        this.setData({
          step: 2
        });
      } else {
        wx.showToast({
          title: '验证码错误',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '验证失败，请稍后重试',
        icon: 'none'
      });
    });
  },

  confirmReset() {
    const { mobile, password, confirmPassword } = this.data;

    if (!password) {
      wx.showToast({
        title: '请设置新密码',
        icon: 'none'
      });
      return;
    }

    if (password.length < 6 || password.length > 20) {
      wx.showToast({
        title: '密码长度应在6-20位之间',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    // 重置密码
    const params = {
      mobile,
      password
    };

    const opt = {
      title: '重置密码中'
    };

    cloudHelper.callCloudSumbit('passport/resetPassword', params, opt).then(result => {
      if (result && result.data && result.data.success) {
        // 重置成功，进入下一步
        this.setData({
          step: 3
        });
      } else {
        wx.showToast({
          title: '密码重置失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.log(err);
      wx.showToast({
        title: '密码重置失败，请稍后重试',
        icon: 'none'
      });
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});
