const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const TaskBiz = require('../../../biz/task_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const helper = require('../../../../../helper/helper.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: true,
		search: '',
		isEdit: true,
		sortMenusDefaultIndex: -1,
		dataList: {
			list: [],
			total: 0,
			pageNo: 1,
			pageSize: 10
		},
		isLoading: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (options && helper.isDefined(options.status)) {
			this.setData({
				_params: {
					sortType: 'status',
					sortVal: options.status,
				}
			});
		}
		else if (options && helper.isDefined(options.type)) {
			this.setData({
				_params: {
					sortType: 'type',
					sortVal: decodeURIComponent(options.type),
				}
			});
		}
		else {
			this.setData({
				sortMenusDefaultIndex: 0,
				_params: {
					sortType: 'status',
					sortVal: ''
				}
			});
		}

		this._getSearchMenu();
		// 加载数据
		this.loadData();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},


	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		// 当选择不同的 tab 时，更新 _params 并重新加载数据
		console.log('bindCommListCmpt called, e:', e);
		if (e.detail && e.detail._params) {
			this.setData({
				_params: e.detail._params
			});
		}
		this.loadData();
	},

	loadData: function () {
		// 添加日志，查看 _params 和 status 的值
		console.log('loadData called, _params:', this.data);
		let status = this.data._params && this.data._params.sortVal ? this.data._params.sortVal : '';
		console.log('loadData called, status:', status);
		let url = '';

		// 根据 status 选择不同的接口
		switch (status) {
			case '0':
				url = 'approval/storage/list'; // 入库申请
				break;
			case '1':
				url = 'approval/rental/list'; // 租借申请
				break;
			case '2':
				url = 'approval/safety/list'; // 安全交底
				break;
			default:
				// 默认加载全部，这里可以根据实际需求选择一个默认接口
				url = 'approval/center/getAllApprovalList';
				break;
		}

		console.log('loadData called, url:', url);
		this.setData({ isLoading: true });

		ApiHelper.post(url, {
			pageNo: this.data.dataList.pageNo,
			pageSize: this.data.dataList.pageSize,
			keyword: this.data.search
		}).then(res => {
			console.log('loadData response:', res);
			if (res.code === 200 && res.data) {
				this.setData({
					dataList: {
						list: res.data.records.map(n=>{
              return {
                ...n,
                approvalStatusBg:this.getStatusColor(n.approvalStatusId)
              }
            }) || [],
						total: res.data.total || 0,
						pageNo: res.data.pageNo || 1,
						pageSize: res.data.pageSize || 10
					},
					isLoading: false
				});
			} else {
				this.setData({ isLoading: false });
			}
		}).catch(err => {
			console.error('加载数据失败:', err);
			this.setData({ isLoading: false });
		});
  },
  
  getStatusColor(statusId) {
    console.log(statusId,"statusId");
    switch (statusId) {
      case 1:
        //
        return 'red';
      default:
        return '#52c41a';
    }
  },

	/** 搜索菜单设置 */
	_getSearchMenu: function () {

		let sortItem3 = [{ label: '分类', type: 'type', value: '' }];
		let type = projectSetting.TASK_DEPT;
		for (let k = 0; k < type.length; k++) {
			sortItem3.push({
				label: type[k],
				type: 'type',
				value: type[k]
			})
		}

		let sortItems = [];

		let sortMenus = [
			{ label: '全部', type: 'status', value: '' },
      { label: '入库审核', type: 'status', value: '0' },
      { label: '进场审核', type: 'status', value: '1' },
			{ label: '离场审核', type: 'status', value: '2' },
			{ label: '安全交底', type: 'status', value: '3' },
		];


		this.setData({
			search: '',
			sortItems,
			sortMenus,
			isLoad: true
		});

	},
	bindDelTap: async function (e) {
		if (!await PassportBiz.loginMustBackWin(this)) return;

		let id = pageHelper.dataset(e, 'id');

		let callback = () => {
			pageHelper.delListNode(id, this.data.dataList.list, '_id');
			this.data.dataList.total--;
			this.setData({
				dataList: this.data.dataList
			});
		}
		await TaskBiz.delTask(id, callback);
	}
})