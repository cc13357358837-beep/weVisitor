const ProjectBiz = require('../../../biz/project_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
  data: {
    projectList: [],
    isLoading: false,
    keyword: '',
    pageNo: 1,
    pageSize: 10
  },

  onLoad() {
    ProjectBiz.initPage(this);
    this.getProjectList();
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  search() {
    this.setData({
      pageNo: 1,
      projectList: []
    });
    this.getProjectList();
  },

  getProjectList() {
    const { keyword, pageNo, pageSize } = this.data;

    this.setData({
      isLoading: true
    });

    ApiHelper.post('project/list', {
      pageNo,
      pageSize,
      keyword
    }, {
      loadingText: '加载中'
    }).then(data => {
      console.log(data,"data");
      if (data.code === 200 && data.data && data.data.records) {
        let projectList = this.data.projectList;
        if (pageNo === 1) {
          projectList = data.data.records;
        } else {
          projectList = projectList.concat(data.data.records);
        }
        this.setData({
          projectList,
          isLoading: false
        });
      } else {
        this.setData({
          projectList: [],
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

  onReachBottom() {
    if (!this.data.isLoading) {
      this.setData({
        pageNo: this.data.pageNo + 1
      });
      this.getProjectList();
    }
  }
});
