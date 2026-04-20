const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
  data: {
    projectData: null,
    isLoading: false
  },

  onLoad(options) {
    ProjectBiz.initPage(this);
    if (options.id) {
      this.getProjectDetail(options.id);
    }
  },

  getProjectDetail(id) {
    this.setData({
      isLoading: true
    });

    ApiHelper.post('project/detail', {
      id
    }, {
      loadingText: '加载中'
    }).then(data => {
      if (data.code === 200 && data.data) {
        this.setData({
          projectData: data.data,
          isLoading: false
        });
      } else {
        this.setData({
          projectData: null,
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

  goToEquipmentList() {
    if (this.data.projectData && this.data.projectData.id) {
      wx.navigateTo({
        url: '/projects/visit/pages/equipment/list/equipment_list?projectId=' + this.data.projectData.id
      });
    }
  }
});
