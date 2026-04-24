const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const TaskBiz = require('../../../biz/task_biz.js');
const PublicBiz = require('../../../../../comm/biz/public_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const ApiHelper = require('../../../../../helper/api_helper.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        ProjectBiz.initPage(this);

        // 初始化表单数据
        let formData = TaskBiz.initFormData('');
        
        // 获取设备类型列表
        const equipmentTypeRes = await ApiHelper.post('enum/equipmentType/list', {});
        console.log(equipmentTypeRes,"equipmentTypeRes");
        
        const equipmentTypes = equipmentTypeRes.code === 200 && equipmentTypeRes.data ? equipmentTypeRes.data : [];

        // 获取设备来源列表
        const equipmentSourceRes = await ApiHelper.post('enum/equipmentSource/list', {});
        const equipmentSources = equipmentSourceRes.code === 200 && equipmentSourceRes.data ? equipmentSourceRes.data : [];

        // 处理数据格式，适配 selectOptions
        // 保存原始数据，用于后续获取 id
        this.setData({
            equipmentTypes,
            equipmentSources
        });
        
        // 为 selectOptions 准备数据
        const equipmentTypeOptions = equipmentTypes.map(item => item.name || item.value);
        const equipmentSourceOptions = equipmentSources.map(item => item.name || item.value);
        console.log(equipmentTypeOptions, equipmentSourceOptions, "equipmentSourceOptions");

        // 为设备类型和设备来源字段添加 selectOptions
        let fields = formData.fields;
        if (fields) {
            fields.forEach(field => {
                if (field.mark === 'equipmentTypeId') {
                    field.selectOptions = equipmentTypeOptions;
                } else if (field.mark === 'equipmentSourceId') {
                    field.selectOptions = equipmentSourceOptions;
                }
            });
        }

        // 更新表单数据
        formData.fields = fields;
        this.setData(formData);

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
    },



    url: function (e) {
        pageHelper.url(e, this);
    },



    bindCheckTap: async function (e) {
        if (!await PassportBiz.loginMustCancelWin(this)) return;
        this.selectComponent("#task-form-show").checkForms();
    },

    bindSubmitCmpt: async function (e) {
		
        if (!await PassportBiz.loginMustCancelWin(this)) return;

        let forms = e.detail;

        // 处理设备类型和设备来源，将名称转换为 id
        let equipmentTypes = this.data.equipmentTypes;
        let equipmentSources = this.data.equipmentSources;
        
        forms.forEach(form => {
            if (form.mark === 'equipmentTypeId' && form.val) {
                // 根据名称查找对应的 id
                let type = equipmentTypes.find(item => item.name === form.val);
                if (type) {
                    form.val = type.id;
                }
            } else if (form.mark === 'equipmentSourceId' && form.val) {
                // 根据名称查找对应的 id
                let source = equipmentSources.find(item => item.name === form.val);
                if (source) {
                    form.val = source.id;
                }
            }
        });

        let callback = async () => {
            try {
                let opts = {
                    title: '提交中'
                }
                let params = {
                    forms,
                }

            } catch (err) {
                console.log(err);
            };
        }


        wx.requestSubscribeMessage({
            tmplIds: [projectSetting.NOTICE_TEMP_APPT],
            async complete() {
                callback();
            }
        });
    }

})