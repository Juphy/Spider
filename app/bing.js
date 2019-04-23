let request = require("request-promise"),
    cheerio = require("cheerio");

let weibo = require("../main");

const {
    Bing
} = require("../lib/model");

let index = 1;

const getPerPage = async () => {
    let images = [];
    let $ = await request({
        url: "https://bing.ioliu.cn/?p=" + index,
        transform: body => {
            return cheerio.load(body);
        }
    });
    $('.container .item .card').each(async (i, ele) => {
        let _$ = cheerio.load($(ele).html());
        images.push({
            url: _$('img').attr("src"),
            title: _$('.description h3').text(),
            day: _$('.description .calendar .t').text()
        });
    });
    return images;
}

const handleImg = async (images) => {
    let i = 0;
    while (i < images.length) {
        let img = images[i];
        let bing = await Bing.findOne({
            where: {
                name: img.title
            }
        });
        if (!bing) {
            let result;
            try {
                result = await weibo.uploadImg(img.url);
            } catch (e) {
                console.log('cookie error', result)
                weibo.TASK && weibo.TASK.cancel();
                await weibo.loginto();
                result = await weibo.uploadImg(img.url);
            }
            if (result.pid) {
                await Bing.create({
                    name: img.title,
                    width: 1920,
                    height: 1080,
                    url: img.url,
                    sina_url: `http://ww1.sinaimg.cn/large/${result.pid}.jpg`,
                    day: img.day
                });
            }
        }
        if (img.day === '2016-03-05') {
            index = 0;
        }
        i++;
    }
}

let main = async () => {
    let images = await getPerPage();
    await handleImg(images);
    if (!index) {
        index++;
        await main();
    }
}

main();