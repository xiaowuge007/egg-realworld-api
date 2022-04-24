'use strict';

const Controller = require('egg').Controller;
const md5 = require('../utils/md5');

class UserController extends Controller {
  async login() {
    const { ctx } = this;
    const { user } = ctx.request.body;
    // 验证参数
    ctx.validate({
      user: {
        type: 'object',
        rule: {
          email: {
            type: 'email',
          },
          password: {
            type: 'string',
          },
        },
      },
    });
    // 判断当前用户是否存在
    let ret = await this.service.user.findUser({ email: user.email }, '+password');
    if (!ret) {
      ctx.throw(422, 'Validation Failed', {
        errors: [
          { message: '当前用户不存在' },
        ],
      });
    }
    if (ret.password !== md5(user.password)) {
      ctx.throw(422, 'Validation Failed', {
        errors: [
          { message: '用户密码不正确' },
        ],
      });
    }
    ret.token = this.service.user.createToken({
      userId: ret._id,
    });
    ret = ret.toObject();
    delete ret.password;
    ctx.body = ret;
  }
  async register() {
    const { ctx, service } = this;
    ctx.validate({
      user: {
        type: 'object',
        rule: {
          username: {
            type: 'string',
          },
          email: {
            type: 'email',
          },
          password: {
            type: 'string',
          },
        },
      },
    });
    const { user } = ctx.request.body;
    // 判断用户是否存在
    if (await service.user.findUser({ username: user.username }, '+password')) {
      ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'username',
            message: 'has already exists',
          },
        ],
      });
    }
    if (await service.user.findUser({ email: user.email }, '+password')) {
      ctx.throw(422, 'Validation Failed', {
        errors: [
          {
            code: 'invalid',
            field: 'email',
            message: 'has already exists',
          },
        ],
      });
    }
    let ret = await service.user.saveUser(ctx.request.body.user);
    ret = ret.toObject();
    delete ret.password;
    ctx.body = {
      user: ret,
    };
  }
  async getCurrentUser() {
    this.ctx.body = this.ctx.currentUser;
  }
  async updateUser() {
    const { ctx } = this;
    const { user } = this.ctx.request.body;
    // 验证参数
    ctx.validate({
      user: {
        type: 'object',
        required: true,
        rule: {
          email: {
            type: 'email',
            required: false,
          },
          password: {
            type: 'string',
            required: false,
          },
          bio: {
            type: 'string',
            required: false,
          },
          image: {
            type: 'string',
            required: false,
          },
        },
      },
    });

    if (user.username) {
      ctx.currentUser.username = user.username;
    }
    if (user.password) {
      ctx.currentUser.password = md5(user.password);
    }
    if (user.email) {
      ctx.currentUser.email = user.email;
    }
    if (user.bio) {
      ctx.currentUser.bio = user.bio;
    }
    if (user.image) {
      ctx.currentUser.image = user.image;
    }
    ctx.currentUser.update_date = new Date();
    const ret = await this.service.user.updateUser(ctx.currentUser);
    // ret = ret.toObject();
    delete ret.password;
    ctx.body = ret;
  }
  async getUserInfo() {
    const { ctx } = this;
    const followUser = await this.service.user.findUser({
      username: ctx.params.username,
    });
    if (!followUser) {
      ctx.throw(422, 'user Failed', {
        errors: [
          {
            message: '您所获取的用户不存在',
          },
        ],
      });
    }
    // 如果存在
    const currentUser = await this.service.user.findUser({
      _id: ctx.currentUser._id,
    }, '+follower');
    const following = currentUser.follower.some(id => {
      return id.toString() === followUser._id.toString();
    });
    ctx.body = {
      profile: {
        username: followUser.username,
        bio: followUser.bio,
        image: followUser.image,
        following,
      },
    };
  }
  async followUser() {
    const { ctx } = this;
    const followUser = await this.service.user.findUser({
      username: ctx.params.username,
    });
    if (!followUser) {
      ctx.throw(422, 'user Failed', {
        errors: [
          {
            message: '您关注的用户不存在',
          },
        ],
      });
    }
    // 如果存在
    const currentUser = await this.service.user.findUser({
      _id: ctx.currentUser._id,
    }, '+follower');
    currentUser.follower = currentUser.follower || [];
    // 判断是否已经关注
    const flag = currentUser.follower.some(id => {
      return id.toString() === followUser._id.toString();
    });
    if (!flag) {
      currentUser.follower.push(followUser._id);
      await this.service.user.updateFollower(currentUser.follower);
    }

    ctx.body = {
      profile: {
        username: followUser.username,
        bio: followUser.bio,
        image: followUser.image,
        following: true,
      },
    };
  }
  async unFollowUser() {
    const { ctx } = this;
    const followUser = await this.service.user.findUser({
      username: ctx.params.username,
    });
    if (!followUser) {
      ctx.throw(422, 'user Failed', {
        errors: [
          {
            message: '您取消关注的用户不存在',
          },
        ],
      });
    }
    // 如果存在
    const currentUser = await this.service.user.findUser({
      _id: ctx.currentUser._id,
    }, '+follower');
    currentUser.follower = currentUser.follower || [];
    // 判断是否已经关注
    let index;
    const flag = currentUser.follower.some((id, i) => {
      index = i;
      return id.toString() === followUser._id.toString();
    });
    if (flag) {
      currentUser.follower.splice(index, 1);
      await this.service.user.updateFollower(currentUser.follower);
    }

    ctx.body = {
      profile: {
        username: followUser.username,
        bio: followUser.bio,
        image: followUser.image,
        following: false,
      },
    };
  }
}

module.exports = UserController;
