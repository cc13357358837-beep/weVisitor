const ApiHelper = require('../helper/api_helper.js');
const cacheHelper = require('../helper/cache_helper.js');
const cloudHelper = require('../helper/cloud_helper.js');
const constants = require('../comm/constants.js');

const listeners = new Set();
let pendingPromise = null;

function normalizeStatus(user) {
	if (typeof user.USER_STATUS === 'number') return user.USER_STATUS;
	if (typeof user.status === 'number') return user.status;

	const status = Number(user.status);
	return Number.isNaN(status) ? 1 : status;
}

function normalizeUser(user) {
	if (!user || typeof user !== 'object') return null;

	const realName = user.realName || user.USER_NAME || '';
	const mobile = user.phone || user.USER_MOBILE || '';

	return {
		...user,
		realName,
		phone: mobile,
		position: user.position || '',
		USER_NAME: realName,
		USER_MOBILE: mobile,
		USER_STATUS: normalizeStatus(user),
		USER_FORMS: user.USER_FORMS || user.forms || {}
	};
}

const cachedUser = normalizeUser(cacheHelper.get(constants.CACHE_USER_PROFILE));

const state = {
	user: cachedUser,
	loaded: !!cachedUser,
	loading: false,
	error: null
};

function getToken() {
	return cacheHelper.get(constants.CACHE_TOKEN);
}

function hasToken() {
	const token = getToken();
	if (!token) return false;
	if (typeof token === 'string') return token.trim().length > 0;
	return !!(token.id || token.token || token.accessToken);
}

function hasApiToken() {
	const token = getToken();
	if (!token) return false;
	if (typeof token === 'string') return token.trim().length > 0;
	return !!(token.token || token.accessToken);
}

function persistUser(user) {
	if (user) {
		cacheHelper.set(constants.CACHE_USER_PROFILE, user, constants.CACHE_TOKEN_EXPIRE);
	} else {
		cacheHelper.remove(constants.CACHE_USER_PROFILE);
	}
}

function getSnapshot() {
	return {
		...state,
		user: state.user ? { ...state.user } : null
	};
}

function emit() {
	const snapshot = getSnapshot();
	listeners.forEach(listener => {
		try {
			listener(snapshot);
		} catch (err) {
			console.error('userStore listener error:', err);
		}
	});
}

const userStore = {
	subscribe(listener, emitNow = true) {
		if (typeof listener !== 'function') return () => {};

		listeners.add(listener);
		if (emitNow) listener(getSnapshot());

		return () => {
			listeners.delete(listener);
		};
	},

	getState() {
		return getSnapshot();
	},

	getUser() {
		return state.user ? { ...state.user } : null;
	},

	hasUser() {
		return !!state.user;
	},

	setUser(user) {
		state.user = normalizeUser(user);
		state.loaded = !!state.user;
		state.error = null;

		persistUser(state.user);
		emit();

		return this.getUser();
	},

	patchUser(patch = {}) {
		const nextUser = normalizeUser({
			...(state.user || {}),
			...(patch || {})
		});

		return this.setUser(nextUser);
	},

	clearUser() {
		pendingPromise = null;
		state.user = null;
		state.loaded = false;
		state.loading = false;
		state.error = null;

		persistUser(null);
		emit();
	},

	async loadProfile({ force = false, silent = false } = {}) {
		if (!hasToken()) {
			this.clearUser();
			return null;
		}

		if (!force && state.user) {
			return this.getUser();
		}

		if (pendingPromise) return pendingPromise;

		state.loading = true;
		state.error = null;
		emit();

		const loadRequest = hasApiToken()
			? ApiHelper.post('user/profile', {}, {
				showLoading: !silent,
				loadingText: '加载中',
				showError: false
			}).then(res => {
				const isSuccess = res && (res.code === 0 || res.code === 200);
				if (!isSuccess || !res.data) {
					state.error = res || null;
					state.loaded = true;
					emit();
					return this.getUser();
				}

				return this.setUser(res.data);
			})
			: cloudHelper.callCloudData('passport/my_detail', {}, {
				title: '加载中',
				hint: !silent
			}).then(user => {
				if (!user) {
					state.loaded = true;
					emit();
					return this.getUser();
				}

				return this.setUser(user);
			});

		pendingPromise = loadRequest.catch(err => {
			state.error = err || null;
			emit();
			throw err;
		}).finally(() => {
			state.loading = false;
			pendingPromise = null;
			emit();
		});

		return pendingPromise;
	},

	async refreshProfile(options = {}) {
		return this.loadProfile({
			...options,
			force: true
		});
	},

	async updateProfile(payload, options = {}) {
		const res = await ApiHelper.post('/user/realName/update', payload, {
			loadingText: '保存中',
			...(options || {})
		});

		const isSuccess = res && (res.code === 0 || res.code === 200);
		if (!isSuccess) return res;

		this.patchUser({
			realName: payload.realName,
			phone: payload.phone,
			position: payload.position
		});

		this.refreshProfile({ silent: true }).catch(err => {
			console.error('刷新个人资料失败:', err);
		});

		return res;
	}
};

module.exports = userStore;
