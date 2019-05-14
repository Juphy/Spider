let request = require("request-promise"),
    schedule = require('node-schedule'),
    cheerio = require("cheerio");
let { URL_BING: URL, BING: BING } = require("../config");
let weibo = require("../main");

const {
    Bing
} = require("../lib/model");

let index = 1;

const getPerPage = async() => {
    let images = [];
    let html;
    try {
        html = await request({
            url: URL + "/?p=" + index
        });
        let $ = await cheerio.load(html);
        if ($('.container .item .card').html()) {
            $('.container .item .card').each(async(i, ele) => {
                let _$ = cheerio.load($(ele).html());
                images.push({
                    url: _$('img').attr("src"),
                    title: _$('.description h3').text(),
                    day: _$('.description .calendar .t').text()
                });
            });
        }
    } catch (e) {
        console.log(e);
    }
    return images;
}

const handleImg = async(images) => {
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

let main = async() => {
    let images = await getPerPage();
    await handleImg(images);
    if (index) {
        index++;
        await main();
    }
}

// main();

let refresh = async() => {
    let datas = await request({
        url: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN',
        transform: data => {
            data = JSON.parse(data);
            return data['images']
        }
    });
    let i = 0;
    while (i < datas.length) {
        let data = datas[i],
            url = BING + data.urlbase + '_1920x1080.jpg';
        let bing = await Bing.findOne({
            where: {
                name: data['copyright']
            }
        });
        if (!bing) {
            let result;
            try {
                result = await weibo.uploadImg(url)
            } catch (e) {
                console.log('cookie error', result)
                weibo.TASK && weibo.TASK.cancel();
                await weibo.loginto();
                result = await weibo.uploadImg(url);
            }
            let date = data.enddate;
            await Bing.create({
                name: data.copyright,
                width: 1920,
                height: 1080,
                url: url,
                sina_url: (result && result.pid) ? `http://ww1.sinaimg.cn/large/${result.pid}.jpg` : '',
                day: date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6),
            });
        } else {
            if (!bing.sina_url) {
                let result;
                try {
                    result = await weibo.uploadImg(url)
                } catch (e) {
                    console.log('cookie error', result)
                    weibo.TASK && weibo.TASK.cancel();
                    await weibo.loginto();
                    result = await weibo.uploadImg(url);
                }
                await bing.update({
                    sina_url: (result && result.pid) ? `http://ww1.sinaimg.cn/large/${result.pid}.jpg` : ''
                })
            }
        }
        i++;
    }
}

const rule = new schedule.RecurrenceRule();
rule.hour = [0, 11];
rule.minute = [0];
rule.second = [0];
schedule.scheduleJob(rule, async() => {
    console.log("重启时间", new Date().toLocaleString());
    await refresh();
});
refresh();