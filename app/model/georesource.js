module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const objectid=Schema.ObjectId;
    const ResourceGeoSchema = new Schema({ 
       res_guid:{type:String,required:true},//资源主键ID
       code:{type:String,required:true},//资源编码
       name:{type:String,required:true},//资源名称
       area_guid:{type:String},//区域GUID用来用户对应查询
       area_treecode:{type:String},//区域树形编码
       area_name:{type:String,required:true},//所属区域
       category:{type:String,required:true},//资源所属类型
       memo:{type:String},//描述
       sub_category:{type:String},//资源子分类
       status:{type:String,default:'0'},//资源状态 0在线、1离线、2故障、3报警
       loc: { type: {type:String}, coordinates:{type:Array} },    //当前经纬度
       ip4_address:{type:String},//IP4地址
       ip6_address:{type:String},//IP6地址
       isdeleted:{type:Boolean,default:false},
       create_at: { type: Date, default: Date.now },
       update_at: { type: Date, default: Date.now }
    });
    //地图空间索引
    ResourceGeoSchema.index( { loc : "2dsphere" }  ) ;
    ResourceGeoSchema.index( {res_guid:1}, { unique: true } ) ;
    return mongoose.model('geo.resource', ResourceGeoSchema);
  }