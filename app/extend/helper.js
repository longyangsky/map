
module.exports ={
    //投影数组
    map :function (data,fun){
        let arr=[];
        data.forEach(element => {
            arr.push(fun(element))
        });
        return arr;
    },
    // 获取 Token
    getAccessToken: ctx => {
    let bearerToken = ctx.request.header.authorization;
    return bearerToken && bearerToken.replace("Bearer ", "");
  },
  
  // 校验 Token
  verifyToken :async (ctx, userId) => {
    let token = this.getAccessToken(ctx);
    let verifyResult = await ctx.service.user.verifyToken(token);
    if (!verifyResult.verify) {
      ctx.helper.error(ctx, 401, verifyResult.message);
      return false;
    }
    if (userId != verifyResult.message.id) {
      ctx.helper.error(ctx, 401, "用户 ID 与 Token 不一致");
      return false;
    }
    return true;
  },
  
  // 处理成功响应
  success : (ctx, result = null, message = "请求成功", status = 200) => {
    ctx.body = {
      code: 0,
      message: message,
      data: result
    };
    ctx.status = status;
  },
  
  // 处理失败响应
  error : (ctx, code, message) => {
    ctx.body = {
      code: code,
      message: message
    };
    ctx.status = code;
  }
}
 