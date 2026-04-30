const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
  data: {
    equipmentList: [],
    isLoading: false,
    pageNo: 1,
    pageSize: 10,
    keyword: '',
    projectId: 0
  },

  onLoad(options) {
    ProjectBiz.initPage(this);
    if (options.projectId) {
      this.setData({
        projectId: Number(options.projectId)
      });
    }
    this.getEquipmentList();
  },

  onReachBottom() {
    if (!this.data.isLoading) {
      this.setData({
        pageNo: this.data.pageNo + 1
      });
      this.getEquipmentList();
    }
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  search() {
    this.setData({
      pageNo: 1,
      equipmentList: []
    });
    this.getEquipmentList();
  },

  getEquipmentList() {
    this.setData({
      isLoading: true
    });

    ApiHelper.post('device/listByProId', {
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize,
      keyword: this.data.keyword,
      projectId: this.data.projectId
    }, {
      loadingText: '加载中'
    }).then(data => {
      if (data.code === 200 && data.data && data.data.records) {
        const list = data.data.records.map(n => {
          return {
            ...n,
            statusBg: this.getStatusColor(n.statusId)
          }
        })
        this.setData({
          equipmentList: this.data.pageNo === 1 ? list : [...this.data.equipmentList, ...list],
          isLoading: false
        });
        console.log(this.data.equipmentList, "equipmentList");
      } else {
        this.setData({
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
    console.log(statusId, "statusId");
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

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/projects/visit/pages/equipment/detail/equipment_detail?id=' + id
    });
  }
});