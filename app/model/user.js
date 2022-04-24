'use strict';

const common = require('./common');
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    ...common,
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    bio: {
      type: String,
    },
    image: {
      type: String,
    },
    follower: {
      type: [ Schema.Types.ObjectId ],
      select: false,
    },
  });

  return mongoose.model('User', UserSchema);
};
