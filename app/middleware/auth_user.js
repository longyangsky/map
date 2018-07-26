module.exports = () => {
    return async function (ctx, next) { 
        ctx.locals.current_user = null; 
        const token  =ctx.cookies.get('token'); 
        if ( !token) {  
            //验证token
            return ctx.redirect(ctx.app.config.PlatformInfo.web_loginurl);
        }
        let decodeToken= await ctx.service.token.verifyToken(token);
        if(decodeToken.verify){  
           ctx.locals.current_user  = await ctx.service.user.findByYhid(decodeToken.message.uid); 
           ctx.locals.current_user.token=token;
           await next();  
        }else{
            return ctx.redirect(ctx.app.config.PlatformInfo.web_loginurl);
        }
        //console.log(decodeToken);
    }
}