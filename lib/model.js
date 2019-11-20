let {
    sequelize
} = require("./mysql.js");

const Sequelize = require("sequelize");
const moment = require('moment');
const bings = sequelize.define("bing", {
    name: {
        type: Sequelize.STRING
    },
    title: {
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
    imgur: {
        type: Sequelize.STRING
    },
    day: {
        type: Sequelize.DATE,
        get() {
            if (!this.getDataValue('day')) {
                return null
            }
            return moment(this.getDataValue('day')).format('YYYY-MM-DD');
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

bings.sync();

module.exports = {
    "Bing": bings
}