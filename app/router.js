'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
const auth = require('./middleware/auth');
module.exports = app => {
  const { router, controller, config } = app;

  router.prefix(config.prefix);
  // router.get('/', controller.home.index);

  // 用户相关路由
  router.post('/users', controller.user.register);// 用户注册
  router.post('/users/login', controller.user.login);// 用户登录
  router.get('/user', auth(), controller.user.getCurrentUser);// 获取当前用户
  router.put('/user', auth(), controller.user.updateUser);// 更新用户
  router.get('/profiles/:username', auth(), controller.user.getUserInfo);// 获取用户详情
  router.post('/profiles/:username/follow', auth(), controller.user.followUser);// 关注用户
  router.delete('/profiles/:username/follow', auth(), controller.user.unFollowUser);// 取消关注用户

  // 文章相关路由
  router.post('/articles', auth(), controller.article.addArticle);// 创建文章
  router.put('/articles/:slug', auth(), controller.article.updateArticle);// 更新文章
  router.delete('/articles/:slug', auth(), controller.article.delArticle);// 删除文章
  router.get('/articles', auth(), controller.article.getArticles);// 获取文章列表
  router.get('/articles/:slug', auth(), controller.article.getArticle);// 获取文章详情
  router.post('/articles/:slug/favorite', auth(), controller.article.favoriteArticle);// 文章点赞
  router.delete('/articles/:slug/favorite', auth(), controller.article.unFavoriteArticle);// 文章点赞

  router.post('/articles/:slug/comments', auth(), controller.comment.addComment);// 添加评论
  router.get('/articles/:slug/comments', auth(), controller.comment.getComments);// 获取评论列表
  router.delete('/articles/:slug/comments/:id', auth(), controller.comment.delComment);// 获取评论列表

  router.get('/tags', controller.article.getTags);// 获取标签列表

};
