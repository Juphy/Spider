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
    category: {
        type: Sequelize.STRING
    },
    tag: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    sinaurl: {
        type: Sequelize.STRING
    },
    create_time: {
        type: Sequelize.DATE,
        get() {
            if (!this.getDataValue('subscribe_time')) {
                return null
            }
            return moment(this.getDataValue('subscribe_time')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

users.sync();

module.exports = {
    "User": imges
}