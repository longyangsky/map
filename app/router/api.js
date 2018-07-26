'use strict';

module.exports = app => { 
    const apiV1Router = app.router.namespace('/api/v1');  
    const { controller, middleware } = app;
    const { index } = controller.api; 
    const tokenRequired= middleware.tokenRequired();
    apiV1Router.get('/index/find',tokenRequired, index.find);
    apiV1Router.get('/index/findList',tokenRequired,index.findList);
    apiV1Router.get('/index/findListCount',tokenRequired,index.findListCount);  
}