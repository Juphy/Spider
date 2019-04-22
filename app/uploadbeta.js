let cheerio = require('cheerio'),
    schedule = require('node-schedule'),
    request = require("request-promise"),
    { URL_UPLOADBETA: UPLOADBETA, SINAURL: SINA } = require('../config');

let weibo = require("../main");

const {
    Photo
} = require("../lib/model");

let keys = ['推女郎', '性感', '车模', '美腿', "美女", 'beauty', 'sexy', 'BingEverydayWallpaperPicture'];

let i = 5; // keys的索引
let page = 0, pagesize = 20;

const handleImages = async (images) => {
    let j = 0;
    while (j < images.length) {
        let img = images[j];
        let photo = await Photo.findOne({
            where: {
                name: img.title,
                album_name: img.picgroup
            }
        });
        if (!photo) {
            let result;
            try {
                result = await weibo.uploadImg(`${UPLOADBETA}/_s/${img.url}`);
            } catch (e) {
                console.log('cookie error', new Date(), result)
                weibo.TASK && weibo.TASK.cancel();
                await weibo.loginto();
                result = await weibo.uploadImg(`${UPLOADBETA}/_s/${img.url}`);
            }
            photo = await Photo.create({
                name: img.title,
                album_name: img.picgroup,
                url: `${UPLOADBETA}/_s/${img.url}`,
                sina_url: (result && result.pid) ? `http://ww1.sinaimg.cn/large/${result.pid}.jpg` : '',
                width: img.width,
                height: img.height,
                create_time: new Date(),
                tags: [keys[i]]
            })
        } else {
            if (!photo.tags.includes(keys[i])) {
                await photo.update({
                    tags: photo.tags.concat(keys[i])
                })
            }
        }
        j++;
    }
}

const getImages = async () => {
    let images = await request({
        url: `https://uploadbeta.com/api/pictures/search/?key=${encodeURI(keys[i])}&start=${page * pagesize}&offset=${pagesize}`
    });
    images = JSON.parse(images);
    if (images && images.length) {
        await handleImages(images);
        page++;
        await getImages(keys[i]);
    }
}


const main = async (n) => {
    while (i < keys.length) {
        await getImages();
        page = 0;
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, n * 1.5 * 60 * 60 * 1000);
        });
        i++;
    }
}

main(0);

const rule = new schedule.RecurrenceRule();
rule.hour = [12, 23];
rule.minute = [0]
schedule.scheduleJob(rule, async () => {
    i = 0;
    console.log(new Date());
    await main(1);
})
