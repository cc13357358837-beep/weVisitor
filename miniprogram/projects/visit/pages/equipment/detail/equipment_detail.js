const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

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
          equipmentData: equipmentData,
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
  }
});