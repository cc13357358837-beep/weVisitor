const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      name: '',
      plannedUseStartTime: '',
      plannedUseEndTime: '',
      equipmentId: 0,
      equipmentName: ''
    },
    sections: [],
    sectionOptions: [],
    equipmentList: [],
    equipmentOptions: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    ProjectBiz.initPage(this);
    
    // 获取标段列表
    const sectionRes = await ApiHelper.post('section/list', { projectId: 0 });
    const sections = sectionRes.code === 200 && sectionRes.data ? sectionRes.data : [];
    const sectionOptions = sections.map(item => ({
      id: item.id,
      name: item.name || item.sectionName || ''
    }));

    // 获取设备列表 - 使用分页查询，获取所有设备
    const equipmentRes = await ApiHelper.post('device/listByProId', {
      pageNo: 1,
      pageSize: 100,
    });
    const equipmentList = equipmentRes.code === 200 && equipmentRes.data ? equipmentRes.data.records : [];
    console.log(equipmentRes,equipmentList,"equipmentList");
    const equipmentOptions = equipmentList.map(item => ({
      id: item.id,
      name: item.name || ''
    }));

    this.setData({
      sections,
      sectionOptions,
      equipmentList,
      equipmentOptions
    });
  },

  /**
   * 设备选择
   */
  onEquipmentChange: function (e) {
    const index = e.detail.value;
    const equipment = this.data.equipmentOptions[index];
    this.setData({
      'formData.equipmentId': equipment.id,
      'formData.equipmentName': equipment.name
    });
  },

  /**
   * 开始时间选择
   */
  onStartTimeChange: function (e) {
    console.log(e,"111");
    
    this.setData({
      'formData.plannedUseStartTime': e.detail.value
    });
  },

   bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },

  /**
   * 结束时间选择
   */
  onEndTimeChange: function (e) {
    this.setData({
      'formData.plannedUseEndTime': e.detail.value
    });
  },

  /**
   * 提交申请
   */
  submit: async function () {
    if (!await PassportBiz.loginMustCancelWin(this)) return;

    const { equipmentId, plannedUseStartTime, plannedUseEndTime } = this.data.formData;

    // 验证必填项
    if (!equipmentId) {
      wx.showToast({
        title: '请选择设备',
        icon: 'none'
      });
      return;
    }

    if (!plannedUseStartTime) {
      wx.showToast({
        title: '请选择开始时间',
        icon: 'none'
      });
      return;
    }

    if (!plannedUseEndTime) {
      wx.showToast({
        title: '请选择结束时间',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({
        title: '提交中'
      });

      const res = await ApiHelper.post('approval/entry/submit', {
        equipmentId,
        plannedUseStartTime,
        plannedUseEndTime,
      });

      wx.hideLoading();

      if (res.code === 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '提交失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.log(err);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    }
  },

  /**
   * 返回列表
   */
  goBack: function () {
    wx.navigateBack();
  }
});
