'use strict';

const Controller = require('egg').Controller;

class CommentController extends Controller {
  async getComments() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 判断文章是否存在
    const article = await this.service.article.findArticle({ _id: ctx.params.slug });
    if (!article) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    const comments = await this.service.comment.findComments({
      article: ctx.params.slug,
    });
    ctx.body = {
      comments,
    };
  }
  async addComment() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    // 验证参数
    ctx.validate({
      comment: {
        type: 'object',
        rule: {
          body: 'string',
        },
      },
    });
    const data = {
      body: ctx.request.body.comment.body,
      article: ctx.params.slug,
      author: ctx.userId,
    };
    let comment = await this.service.comment.saveComment(data);
    comment = comment.toObject();
    delete comment.article;
    ctx.body = {
      comment,
    };
  }
  async delComment() {
    const { ctx } = this;
    this.service.common.isValid(ctx.params.slug);
    this.service.common.isValid(ctx.params.id);
    // 判断文章是否存在
    const article = await this.service.article.findArticle({ _id: ctx.params.slug });
    if (!article) {
      ctx.throw(422, 'article Failed', {
        errors: [
          { message: '该文章不存在' },
        ],
      });
    }
    // 判断评论是否存在
    const comment = await this.service.comment.findComment({ _id: ctx.params.id });
    if (!comment) {
      ctx.throw(422, 'comment Failed', {
        errors: [
          { message: '该条评论不存在' },
        ],
      });
    }

    // 删除评论
    await this.service.comment.delComment(comment);
    ctx.status = 200;
    ctx.body = {
      message: '删除成功',
    };
  }
}

module.exports = CommentController;
