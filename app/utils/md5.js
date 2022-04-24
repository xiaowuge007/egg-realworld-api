'use strict';

const crypto = require('crypto');

const md5 = data => {
  // 以md5的格式创建一个哈希值
  const hash = crypto.createHash('md5');
  return hash.update(data).digest('hex');
};

module.exports = md5;
