const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
  data: {
    equipmentData: null,
    isLoading: false
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
        this.setData({
          equipmentData: data.data,
          isLoading: false
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

  goToProjectDetail() {
    if (this.data.equipmentData && this.data.equipmentData.projectId) {
      wx.navigateTo({
        url: '/projects/visit/pages/project/detail/project_detail?id=' + this.data.equipmentData.projectId
      });
    }
  }
});
