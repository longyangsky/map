'use strict';

const Controller = require('egg').Controller;

class MapController extends Controller {
    async find() {
        const {
            ctx
        } = this;
   
        let query =  await this.getfindQuery(ctx);
        if (ctx.query.name) {
            query.name = new RegExp(ctx.query.name);
        }
        if (ctx.query.category) {
            query.category = ctx.query.category;
        }
        let data = await ctx.service.georesource.findAll(query)
        let mapData = ctx.helper.map(data, data => {
            return {
                loc: data.loc,
                code: data.code,
                name: data.name,
                area_name: data.area_name,
                category: data.category
            }
        })
        this.ctx.body = mapData;
    }
    async findList() {
        const {
            ctx
        } = this;
        let query = await this.getfindQuery(ctx);
        const pageIndex = ctx.query.pageIndex || 1;
        const opts = {
            sort: {
                create_at: -1
            },
            skip: (pageIndex - 1) * 10,
            limit: 10
        };
        let data = await ctx.service.georesource.findList(query, opts)
        let mapData = ctx.helper.map(data, data => {
            return {
                loc: data.loc,
                zyid: data.res_guid,
                code: data.code,
                name: data.name,
                area_name: data.area_name,
                category: data.category
            }
        })
        return ctx.body = {
            list: mapData
        }
    }
    async findListCount() {
        const {
            ctx
        } = this;
        let query = await this.getfindQuery(ctx);

        let count = await ctx.service.georesource.findCount(query);
        return ctx.body = {
            count: count
        }
    }
    async getfindQuery(ctx) {
        let query = {}
        //加上权限 
        //find({$or:[{area_code:/^00002/},{area_code:/^00001/}],$and:[{name:/测试/}] })

        if (ctx.query.name) {
            query.name = new RegExp(ctx.query.name);
        }
        if (ctx.query.category) {
            query.category = ctx.query.category;
        }
        //空间查询 
        if (ctx.query.geoType) {
            let geoType = ctx.query.geoType;
            let coordinates = ctx.query.coordinates; 

            //根据点查询
            if (geoType.toUpperCase() == 'POINT') {
                let distance = parseInt(ctx.query.distance);
                query.loc = {
                    $near: {
                        $geometry: {
                            type: geoType,
                            coordinates: coordinates.split(',') // coordinates.split(',')
                        },
                        $maxDistance: distance
                    }
                }
            }
            //根据圆形查询
            if (geoType.toUpperCase() == 'CIRCLE') {
                query.loc = {
                    $within: {
                        $center: [coordinates.split(','), ctx.query.radius]
                    }
                }
            } 
            //多边形查询
            if (geoType.toUpperCase() == 'POLYGON') { 
                var polygonStrArr= coordinates.split(';');
                var polygonArr=[];
                polygonStrArr.forEach(element => {
                    polygonArr.push(element.split(',')) 
                });
                //多边形关闭结点
                polygonArr.push(polygonStrArr[0].split(','));  
                query.loc=  { $geoWithin :
                    { $geometry :
                    { type : "Polygon" ,
                    coordinates : [ 
                        polygonArr 
                ]
                    } }
             } 
            } 
                
        }
        query.isdeleted=false; 
        let user=await ctx.service.user.findByYhid(ctx.locals.userid);

        //db['geo.resources'].find({area_treecode:{$in: [/^00001001/,/^00001002/] } })

        //user.resource_areas:
        //
        let regArrExp=[];
        user.resource_areas.forEach(treeCode=>{
            regArrExp.push(new RegExp('^'+treeCode))
        })
        //[new RegExp('^00001002')] 
        query.area_treecode={$in: regArrExp} 
        return query;
    }
}

module.exports = MapController;
