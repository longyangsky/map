module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const objectid=Schema.ObjectId;
    const userSchema = new Schema({   //数据来源框架平台
      YHGUID:{type:String,required:true}, //用户主键ID
       YHXINGMING:{type:String,required:true},//用户姓名
       DLZHANGHAO:String, //登录账号
       ZJDLSHIJIAN:String,//最近登录时间
       ZZJGMINGCHENG:String,//组织机构名
       BMMINGCHENG:String,//部门名
       QYMINGCHENG:{type:String,required:true},//区域名称
       resource_areas:Array,//所具备资源的辖区树形编码
       isdeleted:{type:Boolean,default:false},//时候删除
       create_at: { type: Date, default: Date.now },//创建时间
       update_at: { type: Date, default: Date.now },//更新时间
    }); 
    //地图空间索引  
    userSchema.index({'YHGUID':1}, { unique: true });
     
    return mongoose.model('user', userSchema);
  }