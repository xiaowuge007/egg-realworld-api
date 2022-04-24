'use strict';

module.exports = () => { // 外层函数负责接收参数
  // 返回一个中间件处理函数
  return async function errorHandler(ctx, next) {
    const { authorization } = ctx.request.headers;
    if (!authorization) {
      ctx.throw(403, 'permission invalid', {
        errors: [
          { message: '请先登录' },
        ],
      });
    }
    const token = authorization.split('Token ')[1];
    let user;
    try {
      user = await ctx.service.user.verifyToken(token, ctx.app.config.jwt.secret);
    } catch (err) {
      ctx.throw(403, 'permission invalid', {
        errors: [
          { message: 'token 过期' },
        ],
      });
    }


    // if (!user) {

    // }
    let currentUser = await ctx.service.user.findUser({
      _id: user.userId,
    });
    ctx.userId = currentUser._id;
    currentUser = currentUser.toObject();
    delete currentUser.password;
    ctx.currentUser = currentUser;
    await next();
  };
};
