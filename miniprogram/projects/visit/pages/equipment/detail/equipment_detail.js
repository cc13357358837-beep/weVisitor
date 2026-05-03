const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
  data: {
    equipmentData: null,
    isLoading: false,
    statusBg: '#52c41a'
  },

  onLoad(options) {
    ProjectBiz.initPage(this);
    if (options.id) {
      this.getEquipmentDetail(options.id);
    }
  },

  getEquipmentDetail(id) {
    this.setData({
      isLoading: true
    });

    ApiHelper.post('device/detail', {
      id
    }, {
      loadingText: '加载中'
    }).then(data => {
      if (data.code === 200 && data.data) {
        const equipmentData = data.data;
        const statusBg = this.getStatusColor(equipmentData.statusId);
        this.setData({
          equipmentData: {
            ...equipmentData,
            approvalTime:this.formatTime(equipmentData.approvalTime),
          },
          isLoading: false,
          statusBg: statusBg
        });
      } else {
        this.setData({
          equipmentData: null,
          isLoading: false
        });
      }
    }).catch(err => {
      console.log(err);
      this.setData({
        isLoading: false
      });
    });
  },
  formatTime(timeStr) {
    if (!timeStr) return '';
    // 把T替换成空格，然后截取到秒（去掉.xxx和时区部分）
    return timeStr.replace('T', ' ').substring(0, 19);
  },
  getStatusColor(statusId) {
    switch (statusId) {
      case 1:
        //可用
        return '#52c41a';
      case 2:
        //已授权进场
        return '#faad14';
      case 3:
        //在场使用中
        return '#1890ff';
      case 4:
        //待检
        return '#1890ff';
      case 9:
        //未审核通过
        return '#ff4d4f';
      default:
        return '#52c41a';
    }
  },

  goToProjectDetail() {
    if (this.data.equipmentData && this.data.equipmentData.projectId) {
      wx.navigateTo({
        url: '/projects/visit/pages/project/detail/project_detail?id=' + this.data.equipmentData.projectId
      });
    }
  },

  /**
   * 通过审批
   */
  approve: async function () {
    if (!await PassportBiz.loginMustBackWin(this)) return;

    const equipmentData = this.data.equipmentData;
    if (!equipmentData) return;

    try {
      wx.showLoading({ title: '处理中' });
      const res = await ApiHelper.post('approval/storage/action', {
        id: equipmentData.id,
        status: 1 // 1=通过
      });
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '审批通过', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.log(err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  /**
   * 驳回审批
   */
  reject: async function () {
    if (!await PassportBiz.loginMustBackWin(this)) return;

    let equipmentData = this.data.equipmentData;
    if (!equipmentData) return;

    try {
      wx.showLoading({ title: '处理中' });
      const res = await ApiHelper.post('approval/storage/action', {
        id: equipmentData.id,
        status: 0 // 0=驳回
      });
      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({ title: '已驳回', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.message || '操作失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.log(err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  }
});