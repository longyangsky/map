module.exports = app => {
  const {
    router,
    controller,
    middleware
  } = app;
  const authUser = app.middleware.authUser();
 
  //web端嵌入 
  router.get('/interfaces/Integrate', controller.home.webInterface);
  //cs端嵌入
  router.get('/loginInterface', controller.home.csInterface);

  //正常访问页面
  router.get('/map', controller.home.index); 
}