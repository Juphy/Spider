const Sequelize = require("sequelize");
const { mysql: config } = require("../config.js");

const sequelize = new Sequelize(config.db, config.user, config.pass, {
    host: config.host,
    dialect: "mysql",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: "+08:00",
    logging: false
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = {
    sequelize
}