//得到设备资源通过框架平台 
'use strict'
const Subscription = require('egg').Subscription;
//let translator = require('../extend/gpstranslator'); GIS坐标转换

class ResourceSubscription extends Subscription {
  static get schedule() {
    return {
      // immediate:true,
      interval: '5s', // 1分钟
      type: 'worker', // worker 类型：每台机器上只有一个 worker 会执行这个定时任务，每次执行定时任务的 worker 的选择是随机的。
    };
  }

  async subscribe() {


    const {
      config
    } = this;
    let platformInterfaceUrl = `${config.PlatformInfo.interface_protocol}://${config.PlatformInfo.interface_ip}:${config.PlatformInfo.interface_prot}/`
    //登录得到接口token
    let resultData = await this.ctx.curl(
      `${platformInterfaceUrl}account/login`, {
        method: 'post',
        contentType: 'json',
        data: {
          uid: config.PlatformInfo.interface_uid,
          pwd: config.PlatformInfo.interface_pwd
        },
        dataType: 'json'
      }
    )
    let loginData = resultData.data;
    //拿到令牌后数据同步
    if (loginData.success) {
      if (loginData.data) {
        let token = loginData.data;
        let usersInfo = await this.ctx.curl(`${platformInterfaceUrl}resourcePermissions/getAllusers`, {
          contentType: 'json',
          dataType: 'json',
          data: {
            token: token
          }
        })
        //获取用户数据与用户有查看设备权限的区域
        if (Array.isArray(usersInfo.data.data)) {
          saveUsersInfo(this.ctx, usersInfo.data.data, platformInterfaceUrl, token)
        } else {
          ///dff
          //this.ctx.logger.info('没有获取到同步的用户数据');
        }
        //获取资源数据 
        let currentDate=null;
        let taskConfig=await this.ctx.model.Config.findOne({type:'task'}).exec(); 
        if(taskConfig!=null){
          currentDate = taskConfig.update_at.toLocaleString();
        } 
        let update_at= new Date();

        this.ctx.curl(`${platformInterfaceUrl}resourcePermissions/getAllResourceCamera`, {
          dataType: 'json',
          data: {
            token: token,
            updateDate:currentDate
          }
        }).then(allCameras => { 
          if (Array.isArray(allCameras.data.data)&&allCameras.data.data.length>0) {
            saveCamerasInfo(this.ctx, allCameras.data.data,update_at);
          } else {
            //this.ctx.logger.info('没有获取到同步的用户数据');
          } 
        })
      }
    }


    function saveCamerasInfo(ctx, camerasData,update_at) {   
      camerasData.forEach(camera => {
        ctx.service.georesource.findByResourceId(camera.SBGUID).then(findCamera => {
          let CameraModel = null;
          if (findCamera != null) { //不存在添加，否则更新 
            CameraModel = findCamera;
            CameraModel.update_at = new Date().toLocaleString();
          } else {
            CameraModel = new ctx.model.Georesource();
            CameraModel.res_guid = camera.SBGUID;
          }
          // console.log(camera.JINGDU);
          CameraModel.code = camera.SBBIANMA; //资源编码
          CameraModel.name = camera.SBMINGCHENG; //资源名称
          CameraModel.area_guid = ''; //区域GUID用来用户对应查询
          CameraModel.area_treecode = camera.QYSXBIANMA; //区域树形编码
          CameraModel.area_name = camera.QYMINGCHENG; //所属区域
          CameraModel.category = getResourceTypeByCode(camera.LXBIANMA); //资源所属类型---需要转换
          CameraModel.memo = camera.MIAOSHU; //描述
          CameraModel.sub_category = getSubTypeNameByCode(camera.SBZLEIXING); //资源子分类---需要转换
          CameraModel.status = getStatusNameByCode(camera.SBZTBIANMA); //资源状态 0在线、1离线、2故障、3报警
          CameraModel.loc = {
            type: 'Point',
            coordinates: [parseFloat(camera.JINGDU), parseFloat(camera.WEIDU)]
          }; //[camera.JINGDU, camera.WEIDU]; //当前经纬度
          CameraModel.ip4_address = camera.IP4DIZHI;
          CameraModel.ip6_address = camera.IP6DIZHI;
          CameraModel.isdeleted = camera.XXZHUANGTAI == '0' ? false : true;
          CameraModel.save();
        })
      });
      if(camerasData.length>0){ 
          ctx.model.Config.findOne({
            type: 'task'
          }).exec().then(data => {
            let config = null;
            if (data != null) {   
              ctx.model.Config.updateOne({type:'task',update_at:update_at}).then(data=>{ 
              })
            } else {
              let config = new ctx.model.Config();
              config.type = 'task'
              config.update_at = update_at;
              config.save();  
            }
          })
      }
    }


    function saveUsersInfo(ctx, usersData, url, token) {
      usersData.forEach(user => {
        ctx.service.user.findByYhid(user.YHGUID).then(findUser => {
          let UserModel = null;
          if (findUser != null) { //不存在添加，否则更新 
            UserModel = findUser;
            UserModel.update_at = new Date().toLocaleString();
          } else {
            UserModel = new ctx.model.User();
            UserModel.YHGUID = user.YHGUID;
          }
          UserModel.QYMINGCHENG = user.QYMINGCHENG;
          UserModel.YHXINGMING = user.YHXINGMING;
          UserModel.ZJDLSHIJIAN = user.ZJDLSHIJIAN;
          UserModel.ZZJGMINGCHENG = user.ZZJGMINGCHENG;
          UserModel.ZZJGZHUJIAN = user.ZZJGZHUJIAN;
          UserModel.BMMINGCHENG = user.BMMINGCHENG;
          UserModel.XXZHUANGTAI = user.XXZHUANGTAI;
          UserModel.BMZJID = user.BMZJID;
          UserModel.save().then(data => {
            //设置用户所在区域权限
            let currUserid = UserModel.YHGUID;
            // let userService=ctx.service.user;
            ctx.curl(`${url}resourcePermissions/getallarea/${currUserid}`, {
                data: {
                  token: token
                },
                contentType: 'json',
                dataType: 'json'
              })
              .then(data => {
                let areaTreeCode = [];
                data.data.data.forEach(areas => {
                  areaTreeCode.push(areas.QYSXBIANMA)
                })
                //更新用户所属区域
                /*if(currUserid=='7d46dacd99c44bfa9df4b8cdd8d0500f'){
                  console.log(areaTreeCode);
                }*/
                ctx.service.user.updateByYhid(currUserid, {
                  'resource_areas': areaTreeCode
                }).then(data => {})
              })
          });
        })
      });
    }


    function getResourceTypeByCode(type) {
      let resourceTypeName = '未知类型';
      switch (type) {
        case '131':
        case '132':
          resourceTypeName = '摄像机'
          break;
      }
      return resourceTypeName;
    }

    function getSubTypeNameByCode(subTypecode) {
      let sbuTypeName = '未知';
      switch (subTypecode) {
        case '1':
          sbuTypeName = '球机';
          break;
        case '2':
          sbuTypeName = '半球';
          break;
        case '3':
          sbuTypeName = '固定枪机';
          break;
        case '4':
          sbuTypeName = '带云台枪机';
          break;
        case '5':
          sbuTypeName = '多目';
          break;
        case '6':
          sbuTypeName = '带云台多目';
          break;
        case '6':
          sbuTypeName = '无类型';
          break;
        default:
          break;
      }
      return sbuTypeName;
    }

    function getStatusNameByCode(statusCode) {
      let statusName = '未知';
      switch (statusCode) {
        case '0':
          statusName = '在线';
          break;
        case '1':
          statusName = '离线';
          break;
        case '2':
          statusName = '故障';
          break;
        case '3':
          statusName = '报警';
          break;
        default:
          break;
      }
      return statusName;
    }


  }


}

module.exports = ResourceSubscription;