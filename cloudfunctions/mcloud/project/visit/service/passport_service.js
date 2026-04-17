/**
 * Notes: passport模块业务逻辑 
 * Date: 2020-10-14 07:48:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const cloudBase = require('../../../framework/cloud/cloud_base.js');
const UserModel = require('../model/user_model.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const md5Lib = require('../../../framework/lib/md5_lib.js');
const util = require('../../../framework/utils/util.js');

class PassportService extends BaseProjectService {

	// 密码加密
	encryptPassword(password, salt) {
		if (!salt) {
			salt = util.randomString(6);
		}
		const hash = md5Lib.md5(password + salt);
		return { hash, salt };
	}

	// 注册
	async register(userId, {
		mobile,
		name,
		forms,
		status,
		password
	}) {
		// 判断是否存在
		let where = {
			USER_MINI_OPENID: userId
		}
		let cnt = await UserModel.count(where);
		if (cnt > 0)
			return await this.login(userId);

		where = {
			USER_MOBILE: mobile
		}
		cnt = await UserModel.count(where);
		if (cnt > 0) this.AppError('该手机已注册');

		// 密码加密
		let passwordData = {};
		if (password) {
			passwordData = this.encryptPassword(password);
		}

		// 入库
		let data = {
			USER_MINI_OPENID: userId,
			USER_MOBILE: mobile,
			USER_NAME: name,
			USER_OBJ: dataUtil.dbForms2Obj(forms),
			USER_FORMS: forms,
			USER_STATUS: Number(status)
		};

		// 添加密码相关字段
		if (password) {
			data.USER_PASSWORD = passwordData.hash;
			data.USER_SALT = passwordData.salt;
		}

		await UserModel.insert(data);

		return await this.login(userId);
	}

	// 密码登录
	async passwordLogin(username, password) {
		// 查找用户
		let where = {
			$or: [
				{ USER_MOBILE: username },
				{ USER_NAME: username }
			]
		};
		let fields = 'USER_ID,USER_MINI_OPENID,USER_NAME,USER_PIC,USER_STATUS,USER_PASSWORD,USER_SALT';
		let user = await UserModel.getOne(where, fields);

		if (!user) {
			this.AppError('用户不存在');
		}

		if (user.USER_STATUS !== UserModel.STATUS.COMM) {
			this.AppError('用户状态异常');
		}

		// 验证密码
		if (!user.USER_PASSWORD) {
			this.AppError('用户未设置密码');
		}

		const passwordData = this.encryptPassword(password, user.USER_SALT);
		if (passwordData.hash !== user.USER_PASSWORD) {
			this.AppError('密码错误');
		}

		// 生成token
		let token = {
			id: user.USER_MINI_OPENID,
			key: user.USER_ID,
			name: user.USER_NAME,
			pic: user.USER_PIC,
			status: user.USER_STATUS
		};

		// 异步更新最近更新时间
		let dataUpdate = {
			USER_LOGIN_TIME: this._timestamp
		};
		UserModel.edit({ USER_MINI_OPENID: user.USER_MINI_OPENID }, dataUpdate);
		UserModel.inc({ USER_MINI_OPENID: user.USER_MINI_OPENID }, 'USER_LOGIN_CNT', 1);

		return { token };
	}

	// 发送验证码
	async sendCode(mobile) {
		// 生成验证码
		const code = util.randomNumber(6);

		// 这里应该调用短信服务发送验证码
		// 由于是示例，我们只返回成功
		console.log(`发送验证码 ${code} 到 ${mobile}`);

		// 存储验证码到缓存
		// 实际项目中应该使用redis或其他缓存
		// 这里我们暂时跳过

		return { success: true };
	}

	// 验证验证码
	async verifyCode(mobile, code) {
		// 这里应该验证缓存中的验证码
		// 由于是示例，我们只返回成功
		console.log(`验证验证码 ${code} 对于 ${mobile}`);

		return { success: true };
	}

	// 重置密码
	async resetPassword(mobile, password) {
		// 查找用户
		let where = {
			USER_MOBILE: mobile
		};
		let user = await UserModel.getOne(where);

		if (!user) {
			this.AppError('用户不存在');
		}

		// 密码加密
		const passwordData = this.encryptPassword(password);

		// 更新密码
		let data = {
			USER_PASSWORD: passwordData.hash,
			USER_SALT: passwordData.salt
		};

		await UserModel.edit(where, data);

		return { success: true };
	}

	/** 获取手机号码 */
	async getPhone(cloudID) {
		let cloud = cloudBase.getCloud();
		let res = await cloud.getOpenData({
			list: [cloudID], // 假设 event.openData.list 是一个 CloudID 字符串列表
		});
		if (res && res.list && res.list[0] && res.list[0].data) {

			let phone = res.list[0].data.phoneNumber;

			return phone;
		} else
			return '';
	}

	/** 取得我的用户信息 */
	async getMyDetail(userId) {
		let where = {
			USER_MINI_OPENID: userId
		}
		let fields = 'USER_MOBILE,USER_NAME,USER_FORMS,USER_OBJ,USER_STATUS,USER_CHECK_REASON'
		return await UserModel.getOne(where, fields);
 
	}

	/** 修改用户资料 */
	async editBase(userId, {
		mobile,
		name,
		forms
	}) {
		let whereMobile = {
			USER_MOBILE: mobile,
			USER_MINI_OPENID: ['<>', userId]
		}
		let cnt = await UserModel.count(whereMobile);
		if (cnt > 0) this.AppError('该手机已注册');

		let where = {
			USER_MINI_OPENID: userId
		}

		let user = await UserModel.getOne(where);
		if (!user) return;

		let data = {
			USER_MOBILE: mobile,
			USER_NAME: name,
			USER_OBJ: dataUtil.dbForms2Obj(forms),
			USER_FORMS: forms,
		};

		if (user.USER_STATUS == UserModel.STATUS.UNCHECK)
			data.USER_STATUS = UserModel.STATUS.UNUSE;

		await UserModel.edit(where, data);

	}

	/** 登录 */
	async login(userId) {

		let where = {
			'USER_MINI_OPENID': userId
		};
		let fields = 'USER_ID,USER_MINI_OPENID,USER_NAME,USER_PIC,USER_STATUS';
		let user = await UserModel.getOne(where, fields);
		let token = {};
		if (user) {

			// 正常用户
			token.id = user.USER_MINI_OPENID;
			token.key = user.USER_ID;
			token.name = user.USER_NAME;
			token.pic = user.USER_PIC;
			token.status = user.USER_STATUS;

			// 异步更新最近更新时间
			let dataUpdate = {
				USER_LOGIN_TIME: this._timestamp
			};
			UserModel.edit(where, dataUpdate);
			UserModel.inc(where, 'USER_LOGIN_CNT', 1);

		} else
			token = null;

		return {
			token
		};
	}



}

module.exports = PassportService;