const pageHelper = require('../../../../../helper/page_helper.js');  
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: { 
		userInfo: null,
		showStorageApply: false, // 是否显示入库申请
		showEntryApply: false // 是否显示进场申请
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		await this.getUserProfile();
	},

	 

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {  
		// 每次显示页面都重新获取用户信息，确保权限最新
		await this.getUserProfile();
	},

	/**
	 * 获取用户信息
	 */
	getUserProfile: async function () {
		try {
			const res = await ApiHelper.post('user/profile');
			if (res.code === 200 && res.data) {
				const userInfo = res.data;
				const roleId = userInfo.roleId;
				
				// 根据角色判断权限
				const showStorageApply = roleId === 7 || roleId === 8;
				const showEntryApply = roleId === 5 || roleId === 6;
				
				this.setData({
					userInfo,
					showStorageApply,
					showEntryApply
				});
			}
		} catch (err) {
			console.error('获取用户信息失败', err);
		}
	},

	onPullDownRefresh: async function () { 
		wx.stopPullDownRefresh();
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

	url: async function (e) {
		pageHelper.url(e, this);
	},


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
})