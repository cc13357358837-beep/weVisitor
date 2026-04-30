const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isEdit: true,
		id: '',
		task: null,
		approvalResult: '', // 1=通过, 0=不通过
		approvalReason: '' // 审核理由
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;

		if (!await PassportBiz.loginMustBackWin(this)) return;

		this._loadDetail();
	},

	_loadDetail: async function () {
		try {
			const id = this.data.id;
			const res = await ApiHelper.post('approval/storage/detail', {
				id: Number(id)
			});

			if (res.code === 200 && res.data) {
				this.setData({
					isLoad: true,
					task: res.data
				});
			} else {
				this.setData({ isLoad: null });
				pageHelper.showErrorToast(res.message || '获取详情失败');
			}
		} catch (err) {
			console.error('获取详情失败:', err);
			this.setData({ isLoad: null });
			pageHelper.showErrorToast('获取详情失败');
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

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
	onPullDownRefresh: async function () {
		this.setData({
			isLoad: false
		}, async () => {
			await this._loadDetail();
		});
		wx.stopPullDownRefresh();
	},


	url: function (e) {
		pageHelper.url(e, this);
	},

	// 处理审核结果选择
	bindApprovalResultChange: function (e) {
		this.setData({
			approvalResult: e.detail.value
		});
	},

	// 处理审核理由输入
	bindApprovalReasonInput: function (e) {
		this.setData({
			approvalReason: e.detail.value
		});
	},

	// 提交审核
	submitApproval: async function (status) {
		const { approvalReason, task } = this.data;

		if (!approvalReason && status === 0) {
			wx.showToast({
				title: '驳回时请输入理由',
				icon: 'none'
			});
			return;
		}

		try {
			const res = await ApiHelper.post('/approval/storage/action', {
				id: task.id,
				status: status,
				comment: approvalReason || ''
			});

			if (res.code === 0) {
				wx.showToast({
					title: '审核成功',
					icon: 'success'
				});
				setTimeout(() => {
					wx.navigateBack();
				}, 1500);
			} else {
				wx.showToast({
					title: res.message || '审核失败',
					icon: 'none'
				});
			}
		} catch (err) {
			console.error('审核失败:', err);
			wx.showToast({
				title: '审核失败，请稍后重试',
				icon: 'none'
			});
		}
	},

	// 点击同意
	approve: function () {
		this.submitApproval(1);
	},

	// 点击驳回
	reject: function () {
		this.submitApproval(0);
	}
})