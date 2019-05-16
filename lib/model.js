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
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

images.sync();


const pictures = sequelize.define("web_pictures", {
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
    tags: {
        type: Sequelize.JSON
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

pictures.sync();

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
    category: {
        type: Sequelize.STRING
    },
    tags: {
        type: Sequelize.JSON
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

const photos = sequelize.define("web_photos", {
    name: {
        type: Sequelize.STRING
    },
    width: {
        type: Sequelize.INTEGER
    },
    height: {
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
    tags: {
        type: Sequelize.JSON
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

photos.sync();

const bings = sequelize.define("bing", {
    name: {
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

const imgs = sequelize.define("web_imgs", {
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
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

imgs.sync();

const tupians = sequelize.define("web_tupians", {
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
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

tupians.sync();

const meitus = sequelize.define("web_meitus", {
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
    }
}, {
        timestamps: false,
        freezeTableName: true
    });

meitus.sync();

module.exports = {
    "Image": images,
    "Img": imgs,
    "Album": albums,
    "Picture": pictures,
    "Photo": photos,
    "Bing": bings,
    "Tupian": tupians,
    "Meitu": meitus
}