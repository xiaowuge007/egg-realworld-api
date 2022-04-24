'use strict';
const Service = require('egg').Service;

class CommentService extends Service {
  get Comment() {
    return this.app.model.Comment;
  }
  async findComment(data, populateConfig = { author: true }) {
    let comment = this.Comment.findOne(data);
    if (populateConfig.author === true) {
      comment = comment.populate('author');
    }
    if (populateConfig.article === true) {
      comment = comment.populate('article');
    }
    return comment;
  }
  async findComments(data, populateConfig = { author: true }) {
    let comments = this.Comment.find(data);
    if (populateConfig.author === true) {
      comments = comments.populate('author');
    }
    if (populateConfig.article === true) {
      comments = comments.populate('article');
    }
    return comments;
  }
  async saveComment(data) {
    const comment = new this.Comment(data);
    comment.populate('author');
    await comment.save();
    return this.findComment({ _id: comment._id });
  }
  async delComment(data) {
    return this.Comment.remove({ _id: data._id });
  }
}

module.exports = CommentService;
