let { sequelize } = require("./mysql.js");

const Sequelize = require("sequelize");
const moment = require('moment');

const images = sequelize.define("web_images", {
    name: {
        type: Sequelize.STRING
    },
    width: {
        type: Sequelize.INTEGER
    },
    height: {
        type: Sequelize.INTEGER
    },
    album_id: {
        type: Sequelize.INTEGER
    },
    album_name: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    sina_url: {
        type: Sequelize.STRING
    },
    create_time: {
        type: Sequelize.DATE,
        get() {
            if (!this.getDataValue('create_time')) {
                return null
            }
            return moment(this.getDataValue('create_time')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

images.sync();

const albums = sequelize.define("web_albums", {
    name: {
        type: Sequelize.STRING
    },
    album_url: {
        type: Sequelize.STRING
    },
    width: {
        type: Sequelize.INTEGER
    },
    height: {
        type: Sequelize.INTEGER
    },
    url: {
        type: Sequelize.STRING
    },
    sina_url: {
        type: Sequelize.STRING
    },
    create_time: {
        type: Sequelize.DATE,
        get() {
            if (!this.getDataValue('create_time')) {
                return null
            }
            return moment(this.getDataValue('create_time')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

albums.sync();

module.exports = {
    "Image": images,
    "Album": albums
}