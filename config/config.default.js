'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.name = '在线资源gis';
  //分页20条记录
  config.listCount = 20;
  //默认map的中兴
  config.mapCenter = [112.9439592361,28.2705960387];
  //平台主接口地址
  config.PlatformInfo={
    web_loginurl:'http://127.0.0.1:1033/login.aspx',
    interface_protocol:'http',
    interface_ip:'127.0.0.1',
    interface_prot:'10001',
    interface_uid:'gis', 
  
  } 

  exports.cluster = {
    listen: {
      port: 7001,
      hostname: '192.168.1.103'
      // path: '/var/run/egg.sock',
    }
  }


  // use for cookie sign key, should change to your own and keep security
  config.keys = '20180701_jxj';
  // add your config here
   config.middleware = ['authUser']; 
   config.authUser = {
    enable: true,
    match: ['/map'],
  };
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  };
  config.mongoose = {
    client: {
      // url: 'mongodb://admin:Sky1986@127.0.0.1/webgis', 
      url: 'mongodb://webgis:Sky1986@127.0.0.1:27017/webgis',
      options: {
        useNewUrlParser: true
      }
    }
  };
  config.jwt = {
    enable: false,
    secret: "jxj,AllPlatform"
  };

  //安全配置
  config.security = {
    csrf: { //POST提交
      ignore: '/login' 
    },
     xframe: {//运行外部嵌入
      enable: false
    }
  };
  
  config.alinode = {
    // 从 `Node.js 性能平台` 获取对应的接入参数
    appid: '68017',
    secret: 'e733c7aa145a891e25202e0899577c40e79525e9',
  };
     
  /*config.verificationToken ={
    //match: '/news'
  }*/
  return config;
};
