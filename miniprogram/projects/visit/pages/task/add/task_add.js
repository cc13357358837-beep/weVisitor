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

        // 获取标段列表
        const sectionRes = await ApiHelper.post('section/list', {});
        const sections = sectionRes.code === 200 && sectionRes.data ? sectionRes.data : [];

        // 处理数据格式，适配 selectOptions
        // 保存原始数据，用于后续获取 id
        this.setData({
            equipmentTypes,
            equipmentSources,
            sections
        });
        
        // 为 selectOptions 准备数据
        const equipmentTypeOptions = equipmentTypes.map(item => item.name || item.value);
        const equipmentSourceOptions = equipmentSources.map(item => item.name || item.value);
        const sectionOptions = sections.map(item => item.name || item.sectionName || item.value);
        console.log(equipmentTypeOptions, equipmentSourceOptions, sectionOptions, "options");

        // 为设备类型、设备来源和标段字段添加 selectOptions
        let fields = formData.fields;
        console.log(fields,"fields");
        
        if (fields) {
            fields.forEach(field => {
                if (field.mark === 'equipmentTypeId') {
                    field.selectOptions = equipmentTypeOptions;
                } else if (field.mark === 'equipmentSourceId') {
                    field.selectOptions = equipmentSourceOptions;
                } else if (field.mark === 'sectionId') {
                    field.selectOptions = sectionOptions;
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
        let sections = this.data.sections;
        
        // 将表单数组转换为对象，方便获取字段值
        let formObj = {};
        forms.forEach(form => {
            // 根据名称查找对应的 id
            if (form.mark === 'equipmentTypeId' && form.val) {
                let type = equipmentTypes.find(item => item.name === form.val);
                if (type) {
                    form.val = type.id;
                }
            } else if (form.mark === 'equipmentSourceId' && form.val) {
                let source = equipmentSources.find(item => item.name === form.val);
                if (source) {
                    form.val = source.id;
                }
            } else if (form.mark === 'sectionId' && form.val) {
                let section = sections.find(item => item.name === form.val || item.sectionName === form.val);
                if (section) {
                    form.val = section.id;
                }
            }
            formObj[form.mark] = form.val;
        });

        // 构建提交参数
        let params = {
            name: formObj.name || '',
            serialNumber: formObj.serialNumber || '',
            sectionId: Number(formObj.sectionId) || 0,
            model: formObj.model || '',
            licensePlate: formObj.licensePlate || '',
            factorySerialNumber: formObj.factorySerialNumber || '',
            equipmentTypeId: Number(formObj.equipmentTypeId) || 0,
            equipmentSourceId: Number(formObj.equipmentSourceId) || 0,
            statusId: Number(formObj.statusId) || 0,
            constructionReviewerUserId: Number(formObj.constructionReviewerUserId) || 0,
            inspectionReport: formObj.inspectionReport ? JSON.parse(formObj.inspectionReport) : [],
            insuranceCertificate: formObj.insuranceCertificate ? JSON.parse(formObj.insuranceCertificate) : [],
            rentalCompanyQualification: formObj.rentalCompanyQualification ? JSON.parse(formObj.rentalCompanyQualification) : []
        };

        console.log('提交参数:', params);

        let callback = async () => {
            try {
                let opts = {
                    title: '提交中'
                }
                
                const res = await ApiHelper.post('approval/storage/submit', params, opts);
                
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
                console.log(err);
                wx.showToast({
                    title: '提交失败',
                    icon: 'none'
                });
            }
        }


        wx.requestSubscribeMessage({
            tmplIds: [projectSetting.NOTICE_TEMP_APPT],
            async complete() {
                callback();
            }
        });
    }

})