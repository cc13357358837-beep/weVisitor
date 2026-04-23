/**
 * Notes: API 接口工具类
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2026-04-14
 */

// API 基础域名
const API_BASE_URL = 'http://47.96.66.248:20011/';

// 导入 PassportBiz 类
const PassportBiz = require('../comm/biz/passport_biz.js');

class ApiHelper {
  /**
   * 发送请求
   * @param {string} url - 接口路径
   * @param {object} options - 请求选项
   */
  static request(url, options = {}) {
    // 自动添加 API 前缀
    if (!url.startsWith('http')) {
      url = API_BASE_URL+'zjtj-api/' + url;
    }

    // 默认请求头
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // 检查是否是登录接口
    const isLoginUrl = url.includes('/zjtj-api/auth/login') || url.includes('/auth/login');
    
    // 添加 Authorization 头
    const token = PassportBiz.getToken();
    
    if (token&&!isLoginUrl) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 合并请求头
    const headers = {
      ...defaultHeaders,
      ...options.headers
    };    

    // 显示加载动画
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中',
      });
    }
    
    // 确保 headers 是对象
    if (!headers || typeof headers !== 'object') {
      headers = {
        'Content-Type': 'application/json',
      };
    }
    
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method || 'GET',
        header: headers, // 注意：wx.request 的参数名是 header，不是 headers
        data: options.data || {},
        success: (res) => {          
          // 隐藏加载动画
          if (options.showLoading !== false) {
            wx.hideLoading();
          }

          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            // 处理错误
            if (res.statusCode === 401) {
              // 401 错误，跳转到登录页面
              wx.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none'
              });
              setTimeout(() => {
                wx.reLaunch({
                  url: '/pages/login/login'
                });
              }, 1000);
            } else if (options.showError !== false) {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none'
              });
            }
            reject(res);
          }
        },
        fail: (err) => {
          // 隐藏加载动画
          if (options.showLoading !== false) {
            wx.hideLoading();
          }

          // 处理错误
          if (options.showError !== false) {
            wx.showToast({
              title: '网络错误，请稍后重试',
              icon: 'none'
            });
          }
          reject(err);
        }
      });
    });
  }

  /**
   * GET 请求
   * @param {string} url - 接口路径
   * @param {object} data - 请求数据
   * @param {object} options - 请求选项
   */
  static get(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'GET',
      data
    });
  }

  /**
   * POST 请求
   * @param {string} url - 接口路径
   * @param {object} data - 请求数据
   * @param {object} options - 请求选项
   */
  static post(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      data
    });
  }

  /**
   * PUT 请求
   * @param {string} url - 接口路径
   * @param {object} data - 请求数据
   * @param {object} options - 请求选项
   */
  static put(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      data
    });
  }

  /**
   * DELETE 请求
   * @param {string} url - 接口路径
   * @param {object} data - 请求数据
   * @param {object} options - 请求选项
   */
  static delete(url, data = {}, options = {}) {
    return this.request(url, {
      ...options,
      method: 'DELETE',
      data
    });
  }
}

module.exports = ApiHelper;
