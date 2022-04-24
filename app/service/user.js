'use strict';

const jwt = require('jsonwebtoken');
const md5 = require('../utils/md5');
const Service = require('egg').Service;

class UserService extends Service {
  get User() {
    return this.app.model.User;
  }
  async findUser(data, condition) {
    data = data || {};
    let user;
    if (condition) {
      user = await this.User.findOne(data).select(condition);
    } else {
      user = await this.User.findOne(data);
    }
    // console.log(user);
    return user;
  }
  createToken(data) {
    const token = jwt.sign(data, this.app.config.jwt.secret, {
      expiresIn: this.app.config.jwt.expiresIn,
    });
    return token;
  }

  verifyToken(token) {
    return jwt.verify(token, this.app.config.jwt.secret);
  }
  async saveUser(data) {
    if (data.password) {
      data.password = md5(data.password);
    }
    const user = new this.User(data);
    await user.save();
    user.token = this.createToken({
      userId: user._id,
    });
    return user;
  }
  async updateUser(user) {
    await this.User.updateOne({
      _id: user._id,
    }, {
      ...user,
    });
    return user;
  }
  async updateFollower(follower) {
    await this.User.updateOne({
      _id: this.ctx.currentUser._id,
    }, {
      follower,
    });
  }
}

module.exports = UserService;
