'use strict';

const common = require('./common');
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CommentSchema = new Schema({
    ...common,
    body: {
      type: String,
      required: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Article',
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  });

  return mongoose.model('Comment', CommentSchema);
};
