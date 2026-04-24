/** 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-29 07:48:00 
 */

const cacheHelper = require('../../../../../helper/cache_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const AdminBiz = require('../../../../../comm/biz/admin_biz.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
	data: {
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {		
		// if (PassportBiz.isLogin()) {
		// 	let user = {};
		// 	user.USER_NAME = PassportBiz.getUserName();
		// 	this.setData({ user });
		// }

		// ProjectBiz.initPage(this);

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
		this._loadUser();
		// this._loadUser();

		// if (this.data.isLogin) {
		// 	this._loadMyTaskTypeCount();
		// }
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

	_loadMyTaskTypeCount: async function (e) {

		let opts = {
			title: 'bar'
		}
		let task = await cloudHelper.callCloudData('task/my_type_count', {}, opts);
		if (!task) return;

		this.setData({
			task
		})
	},

	_loadUser: async function (e) {
		try {
			// 调用新的个人信息接口
			const res = await ApiHelper.post('user/profile');
			if (res.code === 0 && res.data) {
				let user = res.data;
				// 确保用户名称存在
				if (user.realName) {
					user.USER_NAME = user.realName;
				}
				this.setData({
					user
				});
			} else {
				console.error('获取用户信息失败:', res);
			}
		} catch (err) {
			console.error('获取用户信息失败:', err);
		}
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		this._loadUser();
		this._loadMyTaskTypeCount();
		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () { },

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindSetTap: function (e, skin) {
		let itemList = ['修改密码','退出登录'];
		wx.showActionSheet({
			itemList,
			success: async res => {
				let idx = res.tapIndex;
				if (idx == 0) {
					// 跳转到修改密码页面
					wx.navigateTo({
						url: '/pages/login/reset/reset'
					});
				} else if (idx == 1) {
					// 退出登录
					PassportBiz.logout();
					pageHelper.showNoneToast('退出登录成功');
					wx.reLaunch({
						url: '/pages/login/login'
					});
				}

			},
			fail: function (res) { }
		})
	}
})