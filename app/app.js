module.exports=app=>{
    app.beforeStart(async()=>{
          app.runSchedule('getResourceByKJPT');
    })
}

 
