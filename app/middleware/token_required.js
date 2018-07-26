module.exports=()=>{
    return async function(ctx,next){
        let token = '';
         /*if (
          ctx.headers.authorization && ctx.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
          token = ctx.headers.authorization.split(' ')[1];
        } else*/ 
         if (ctx.query.accesstoken) {
          token = ctx.query.accesstoken;
        } else if (ctx.request.body.accesstoken) {
          token = ctx.request.body.accesstoken;
        }  
        //解码token
        let decodeToken= await ctx.service.token.verifyToken(token)  
    
        if (!decodeToken.verify) {
          ctx.status = 401;
          ctx.body = {
            success: false,
            message: '错误的 accessToken,请重新登录',
          };
          return;
        }   
        ctx.locals.userid=decodeToken.message.uid;
        await next();
    }
}