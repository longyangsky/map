'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  async findByYhid(id) { 
        return   this.ctx.model.User.findOne({
          YHGUID: id
          }).exec(); 
  }
  async updateByYhid(id,options){   
     return this.ctx.model.User.update({ 'YHGUID': id }, { $set: options}, { multi: false })  ; 
  }
  async findCount(){
      return  this.ctx.model.User.count({
        YHGUID: id
      }).exec();
  }
}

module.exports = UserService;
