'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {
  async getArticles() {
    const { ctx } = this;
    // const { validator } = app;
    const { query } = ctx;
    // 作者查询
    if (query.author) {
      const user = await this.service.user.findUser({ username: query.author });
      query.author = user ? user._id : null;
    }
    const [ articles, count ] = await Promise.all([
      this.service.article.findArticles(query),
      this.service.article.getCount(query),
    ]);
    ctx.body = {
      articles,
      count,
    };
  }
  async getArticle() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 判断文章是否存在
    const data = await this.service.article.findArticle({
      _id: ctx.params.slug,
    });
    if (!data) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    ctx.body = {
      article: data,
    };
  }
  async addArticle() {
    const { ctx } = this;
    const { article } = ctx.request.body;
    // 验证参数
    ctx.validate({
      article: {
        type: 'object',
        rule: {
          title: 'string',
          description: 'string',
          body: 'string',
          tagList: {
            type: 'array',
            itemType: 'string',
            required: false,
          },
        },
      },
    });
    const hasArticle = await this.service.article.findArticle({
      title: article.title,
    });
    if (hasArticle) {
      ctx.throw(422, 'article title Failed', {
        errors: [
          { message: '该文章标题已存在' },
        ],
      });
    }
    article.slug = article.title;
    article.author = ctx.userId;
    let ret = await this.service.article.saveArticle(article);
    ret = ret.toObject();
    delete ret.author._id;
    ctx.body = {
      article: {
        ...ret,
      },
    };
  }
  async updateArticle() {
    const { ctx } = this;
    const { article } = ctx.request.body;
    // 验证参数
    ctx.validate({
      article: {
        type: 'object',
        rule: {
          title: { type: 'string', required: false },
          description: { type: 'string', required: false },
          body: { type: 'string', required: false },
          tagList: {
            type: 'array',
            itemType: 'string',
            required: false,
          },
        },
      },
    });
    // 判断文章是否存在
    const data = await this.service.article.findArticle({
      _id: ctx.params.slug,
    }, null, false);
    // 判断文章作者
    if (data.author.toString() !== ctx.userId.toString()) {
      ctx.throw(422, 'permission invalid', {
        errors: [
          { message: '对不起，您没有权限' },
        ],
      });
    }
    if (!data) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    // 如果存在，更新内容
    if (article.title) {
      data.title = data.slug = article.title;
    }
    if (article.description) {
      data.description = article.description;
    }
    if (article.body) {
      data.body = article.body;
    }
    if (article.tagList) {
      data.tagList = article.tagList;
    }
    data.update_date = new Date();
    let ret = await this.service.article.updateArticle(data.toObject());
    ret = ret.toObject();
    ctx.body = {
      article: {
        ...ret,
      },
    };
  }
  async delArticle() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 判断文章是否存在
    const data = await this.service.article.findArticle({
      _id: ctx.params.slug,
    }, null, false);
    if (!data) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    // 删除文章
    await this.service.article.delArticle(data);
    ctx.status = 204;
    ctx.body = {
      message: '删除成功',
    };
  }
  async favoriteArticle() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 判断文章是否存在
    const data = await this.service.article.findArticle({
      _id: ctx.params.slug,
    });
    if (!data) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    // 判断该用户是否已经点赞
    const favorited = data.favorited || [];
    const isFavorited = favorited.some(id => id.toString() === ctx.userId.toString());
    if (!isFavorited) {
      // 把当前用户加入点赞列表
      favorited.push(ctx.userId);
      await this.service.article.updateArticle({
        _id: data._id,
        favorited,
      });
    }
    const ret = data.toObject();
    ret.favorited = true;
    ctx.body = {
      article: ret,
    };
  }
  async unFavoriteArticle() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 判断文章是否存在
    const data = await this.service.article.findArticle({
      _id: ctx.params.slug,
    });
    if (!data) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    // 判断该用户是否已经点赞
    const favorited = data.favorited || [];
    let index;
    const isFavorited = favorited.some((id, i) => {
      if (id.toString() === ctx.userId.toString()) {
        index = i;
        return true;
      }
      return false;
    });
    if (isFavorited) {
      // 把当前用户加入点赞列表
      favorited.splice(index, 1);
      await this.service.article.updateArticle({
        _id: data._id,
        favorited,
      });
    }
    const ret = data.toObject();
    ret.favorited = false;
    ctx.body = {
      article: ret,
    };
  }
  async getTags() {
    const data = await this.service.article.getTags();
    let tags = [];
    data.forEach(obj => {
      tags.push.apply(tags, obj.tagList);
    });
    tags = Array.from(new Set(tags));
    this.ctx.body = {
      tags,
    };
  }
}

module.exports = ArticleController;
