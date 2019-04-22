let cheerio = require('cheerio'),
    schedule = require('node-schedule'),
    request = require("request-promise"),
    { URL_UPLOADBETA: UPLOADBETA, SINAURL: SINA } = require('../config');

let weibo = require("../main");

const {
    Photo
} = require("../lib/model");

let keys = ['%E6%8E%A8%E5%A5%B3%E9%83%8E', '%E6%80%A7%E6%84%9F', '%E8%BD%A6%E6%A8%A1', '%E7%BE%8E%E8%85%BF', 'sexy', 'BingEverydayWallpaperPicture', ''];

let i = 0;
let page = 0, pagesize = 20;

const handleImages = async (images) => {
    let j = 0;
    while (j < images.length) {
        let img = images[j];
        let photo = await Photo.findOne({
            where: {
                name: img.title
            }
        });
        if (!photo) {
            let result;
            try {
                result = await weibo.uploadImg(`${UPLOADBETA}/_s/${img.url}`);
            } catch (e) {
                console.log('cookie error', result)
                weibo.TASK && weibo.TASK.cancel();
                await weibo.loginto();
                result = await weibo.uploadImg(`${UPLOADBETA}/_s/${img.url}`);
            }
            photo = await Photo.create({
                name: img.title,
                album_name: img.picgroup,
                url: `${UPLOADBETA}/_s/${img.url}`,
                sina_url: result.pid ? `http://ww1.sinaimg.cn/large/${result.pid}.jpg` : '',
                width: img.width,
                height: img.height,
                create_time: new Date(),
                tags: [keys[i]]
            })
        } else {

        }
        j++;
    }
}

const getImages = async (key) => {
    let images = await request({
        url: `https://uploadbeta.com/api/pictures/search/?key=${key}&start=${page * pagesize}&offset=${pagesize}`
    });
    images = JSON.parse(images);
    if (images && images.length) {
        await handleImages(images);
        page++;
        await getImages(key);
    }
}


const main = async () => {
    while (i < keys.length) {
        await getImages(keys[0]);
        i++;
    }
}

main();
