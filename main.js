const WeiBo = require('./weibo/index'),
    config = require('./config');

let weibo = new WeiBo(config);

module.exports = weibo;