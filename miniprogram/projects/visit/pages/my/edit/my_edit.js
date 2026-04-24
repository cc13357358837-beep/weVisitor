const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const validate = require('../../../../../helper/validate.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isEdit: true,

		userRegCheck: projectSetting.USER_REG_CHECK,
		mobileCheck: setting.MOBILE_CHECK
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);
		await this._loadDetail();
	},

	_loadDetail: async function (e) {
		try {
			// 调用新的个人信息接口
			const res = await ApiHelper.post('/user/profile', {});
			if (res.code === 0 && res.data) {
				let user = res.data;
				this.setData({
					isLoad: true,
					isEdit: true,

					user,

					fields: projectSetting.USER_FIELDS,

					formName: user.realName || user.USER_NAME,
					formMobile: user.phone || user.USER_MOBILE,
					formPosition: user.position || '',
					formForms: user.USER_FORMS || {}
				});
			} else {
				pageHelper.showErrorToast('获取个人信息失败');
			}
		} catch (err) {
			console.error('获取个人信息失败:', err);
			pageHelper.showErrorToast('获取个人信息失败');
		}
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
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	bindGetPhoneNumber: async function (e) {
		await PassportBiz.getPhone(e, this);
	},


	bindSubmitTap: async function (e) {
		try {
			let data = this.data;
			// 数据校验 
			data = validate.check(data, PassportBiz.CHECK_FORM, this);
			if (!data) return;

			// 调用新的修改个人信息接口
			const updateData = {
				realName: data.formName,
				phone: data.formMobile,
				position: data.formPosition
			};

			const res = await ApiHelper.post('/user/realName/update', updateData);
			if (res.code === 0) {
				let callback = () => {
					wx.reLaunch({ url: '../index/my_index' });
				}
				pageHelper.showSuccToast('修改成功', 1500, callback);
			} else {
				pageHelper.showErrorToast('修改失败，请重试');
			}
		} catch (err) {
			console.error('修改个人信息失败:', err);
			pageHelper.showErrorToast('修改失败，请重试');
		}
	}
})