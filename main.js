const Imgur = require('./imgur/index'),
    config = require('./config');

let imgur = new Imgur(config);

module.exports = imgur;