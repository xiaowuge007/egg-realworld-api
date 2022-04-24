'use strict';

const Service = require('egg').Service;

class ArticleService extends Service {
  get Article() {
    return this.app.model.Article;
  }
  async findArticles(data, condtion, isPopulate = true) {
    let { offset, limit, author, tag } = data;
    offset = offset ? Number(offset) : 0;
    limit = limit ? Number(limit) : 0;
    const filter = {};
    if (author) filter.author = author;
    if (tag) filter.tagList = tag;
    let articles;
    if (condtion) {
      articles = this.Article.find(filter)
        .select(condtion)
        .limit(limit)
        .skip(offset);
    } else {
      articles = this.Article.find(filter)
        .limit(limit)
        .skip(offset);
    }
    if (isPopulate) return articles.populate('author');
    return articles;
  }
  async getCount(data) {
    const { author, tag } = data;
    const filter = {};
    if (author) filter.author = author;
    if (tag) filter.tagList = tag;
    const count = await this.Article.count(filter);
    return count;
  }
  async findArticle(data, condtion, isPopulate = true) {
    let article;
    if (condtion) {
      article = this.Article.findOne(data).select(condtion);
    } else {
      article = this.Article.findOne(data);
    }
    if (isPopulate) article.populate('author');
    return article;
  }
  async saveArticle(data) {
    const article = new this.Article(data);
    await article.save();
    return this.Article.findOne({ _id: article._id }).populate('author');
  }
  async updateArticle(data) {
    await this.Article.updateOne({ _id: data._id }, {
      ...data,
    });
    return this.Article.findOne({ _id: data._id }).populate('author');
  }
  async delArticle(data) {
    return this.Article.remove({ _id: data._id });
  }
  async getTags() {
    return this.Article.find().select('tagList -_id');

  }
}
module.exports = ArticleService;
