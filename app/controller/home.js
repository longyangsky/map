'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async webInterface(){
    const {
      ctx,
      config
    } = this;

    if(!ctx.query.uid ||  !ctx.query.token){
      ctx.status=404;
      return ctx.body='未找到对页';
    }
    let uid = ctx.query.uid;
    let token = ctx.query.token; 
    if (uid && token ) {
      let platformInterfaceUrl = `${config.PlatformInfo.interface_protocol}://${config.PlatformInfo.interface_ip}:${config.PlatformInfo.interface_prot}/`

      let url = platformInterfaceUrl + `account/validatetoken?uid=${uid}&&token=${token}`;
      let validateResult = await ctx.curl(url, {
        dataType: 'json'
      }); 
      if (validateResult.data.success) {
        //写入cookie=
        ctx.cookies.set('token', token);
         ctx.redirect('/map?Interface=web')   
      } else {
        ctx.status = 401;
        ctx.body = validateResult.data;
      }
    } else {
      ctx.status = 401;
      ctx.body = '未传递正确参数uid,token';
    }
  }
  async csInterface() { //测试端第三方接入接口 
    const {//sdfsdf
      ctx,
      config
    } = this;

    let uid = ctx.query.uid;
    let token = ctx.query.token;
    let pageName = ctx.query.pageName;
    if (uid && token && pageName) {
      let platformInterfaceUrl = `${config.PlatformInfo.interface_protocol}://${config.PlatformInfo.interface_ip}:${config.PlatformInfo.interface_prot}/`

      let url = platformInterfaceUrl + `account/validatetoken?uid=${uid}&&token=${token}`;
      let validateResult = await ctx.curl(url, {
        dataType: 'json'
      });
      //
      if (validateResult.data.success) {
        //写入cookie=
        ctx.cookies.set('token', token);

        switch (pageName) {
          case 'map':
            ctx.redirect('/map')
            break;
          default:
            break;
        }
      } else {
        ctx.status = 401;
        ctx.body = validateResult.data;
      }
    } else {
      ctx.status = 401;
      ctx.body = '未传递正确参数uid,token,pageName';
    }


  }

  async index() { 
    //web端和cs端嵌入时候ui做处理
    let interfaceType=this.ctx.query.Interface || ''; 
    await this.ctx.render('index.html', {
      mapCenter: this.config.mapCenter,
      user: this.ctx.locals.current_user,
      interfaceType:interfaceType
    });
    /*
    if(this.ctx.cookies.get('token')){
      
    }else{ 
      this.ctx.redirect(this.config.PlatformInfo.web_loginurl) ; 
    }*/
    //await this.ctx.render('index.html',{config:this.config}) ; 
  }
}

module.exports = HomeController;
