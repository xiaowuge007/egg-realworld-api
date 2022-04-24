'use strict';

const common = require('./common');
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ArticleSchema = new Schema({
    ...common,
    slug: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tagList: [ String ],
    favorited: {
      type: [ Schema.Types.ObjectId ],
      required: true,
      ref: 'User',
    },
    favoritesCount: Number,
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  });

  return mongoose.model('Article', ArticleSchema);
};
