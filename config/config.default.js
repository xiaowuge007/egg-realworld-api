'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1649905879173_254';

  // add your middleware config here
  config.middleware = [ 'errorHandler' ];

  // 配置请求前缀
  config.prefix = '/api';
  // 安全配置
  config.security = {
    csrf: {
      enable: false,
    },
  };
  // 验证器配置
  config.validate = {
    // convert: false,
    // validateRoot: false,
  };
  // mongoose 配置
  config.mongoose = {
    url: 'mongodb://127.0.0.1/realworld',
    options: {},
    // mongoose global plugins, expected a function or an array of function and options
    plugins: [ ],
  };
  // jwt token 配置
  config.jwt = {
    secret: '0951c88c-da2d-4595-87ec-f9db44309127',
    expiresIn: 60 * 60 * 24,
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
