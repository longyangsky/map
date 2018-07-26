const Service= require('egg').Service;

class ResourceGeoService extends Service{
    async findAll(query){    
        let data = this.ctx.model.Georesource.find(query).exec();  
        return data ;
    } 
    /**
     * 分页查询资源
     * @param {查询条件} query 
     * 
     */ 
    async findList(query,opts=null){
        let data = this.ctx.model.Georesource.find(query,{},opts).exec();  
        return data ; 
    }
    async findCount(query){
        let count = this.ctx.model.Georesource.count(query).exec()  
        return count;
    }
    async findByResourceId(resourceId){
        return  await this.ctx.model.Georesource.findOne({
            res_guid: resourceId
          }).exec(); 
    }

   /* async addResource(){ 
        let Resourcegeo =   this.ctx.model.Georesource();
        Resourcegeo.area_name='长沙市';
        Resourcegeo.area_code='00000';
        Resourcegeo.res_guid='123123123';
        Resourcegeo.ip_address='192.168.1.10'; 
        Resourcegeo.category='摄像机';
        Resourcegeo.sub_category='球机';
        Resourcegeo.loc={type:'Point',coordinates:[109.5983940000, 27.9479330000]}; 
        Resourcegeo.code='sdfsfsdf'; 
        Resourcegeo.name ='测试球机';  
        return  await Resourcegeo.save();  
    }*/
}

module.exports=ResourceGeoService;