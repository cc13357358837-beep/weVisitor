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
		isLoading: false,
		selectedTab: '' // 当前选中的 tab 值
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
				sortMenusDefaultIndex: 0
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

	// 处理 tab 切换事件
	switchTab: function (e) {
		const selectedTab = e.currentTarget.dataset.tab;
		console.log('switchTab called, selectedTab:', selectedTab);
		this.setData({
			selectedTab: selectedTab,
			dataList: {
				list: [],
				total: 0,
				pageNo: 1,
				pageSize: 10
			}
		});
		this.loadData();
	},

	// 处理搜索输入
	onSearchInput: function (e) {
		this.setData({
			search: e.detail.value
		});
	},

	// 处理搜索按钮点击
	search: function () {
		this.setData({
			dataList: {
				list: [],
				total: 0,
				pageNo: 1,
				pageSize: 10
			}
		});
		this.loadData();
	},

	loadData: function () {
		// 添加日志，查看 selectedTab 的值
		console.log('loadData called, selectedTab:', this.data.selectedTab);
		let selectedTab = this.data.selectedTab;
		let url = '';

		// 根据 selectedTab 选择不同的接口
		switch (selectedTab) {
			case '0':
				url = 'approval/storage/list'; // 入库申请
				break;
			case '1':
				url = 'approval/rental/list'; // 入场审核
				break;
			case '2':
				url = 'approval/rental/list'; // 离场审核
				break;
			case '3':
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
			// proName: this.data.search
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
        //不通过
        return 'red';
      default:
        //通过
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
			{ label: '全部', type: 'status', value: '0' },
      { label: '入库审核', type: 'status', value: '1' },
      { label: '进场审核', type: 'status', value: '2' },
			{ label: '离场审核', type: 'status', value: '3' },
			{ label: '安全交底', type: 'status', value: '4' },
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