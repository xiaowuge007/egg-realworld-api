'use strict';

const Service = require('egg').Service;

class CommonService extends Service {
  get mongoose() {
    return this.app.mongoose;
  }
  isValid(id) {
    const flag = this.mongoose.Types.ObjectId.isValid(id);
    if (!flag) {
      this.ctx.throw(422, 'url Failed', {
        errors: [
          { message: 'url 不合法' },
        ],
      });
    }
    return flag;
  }
}
module.exports = CommonService;
