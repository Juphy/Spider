let request = require("request-promise"),
    schedule = require('node-schedule'),
    cheerio = require("cheerio");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
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
    let data1 = await request({
        url: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN',
        headers: {
            Cookie: '_EDGE_V=1; MUID=0E7B9FA5363A6B261D3092E237146A96; MUIDB=0E7B9FA5363A6B261D3092E237146A96; SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=3BF19352E6FB4D2ABE650148171AD0A8&dmnchg=1; _UR=MC=1; _ITAB=STAB=TR; ClarityID=50838af0eab345ec9bc900fe9f69b00e; ai_user=8e1IS|2019-04-23T11:35:41.830Z; SNRHOP=I=&TS=; ipv6=hit=1558068175235&t=4; _EDGE_S=mkt=zh-cn&SID=101522DBAC506D0E2D7A2F84AD7E6CEF; SRCHUSR=DOB=20190423&T=1558064586000; OID=ARABMmHCj2y80dIqZgSxhutSoEI7-lurR7MR6-G4txg06EGnWKDz7gvSKykK4OE7voFgJaT2VrS7bj1VK5YSG06l; ENSEARCH=BENVER=1; _SS=SID=101522DBAC506D0E2D7A2F84AD7E6CEF&bIm=087252&HV=1558064729; ULC=P=CA07|5:2&H=CA07|5:2&T=CA07|5:2:4; SRCHHPGUSR=CW=1880&CH=540&DPR=1&UTC=480&WTS=63693661377',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36'
        },
        transform: data => {
            data = JSON.parse(data);
            return data['images']
        }
    });
    let data2 = await request({
        url: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN',
        transform: data => {
            data = JSON.parse(data);
            return data['images']
        }
    });
    let datas = data1.concat(data2);
    let i = 0;
    while (i < datas.length) {
        let data = datas[i],
            url = BING + data.urlbase + '_1920x1080.jpg';
        let bing = await Bing.findOne({
            where: {
                url: {
                    [Op.like]: '%' + data['urlbase'].split('_')[0] + '%'
                }
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
rule.hour = [0, 12];
rule.minute = [0];
rule.second = [0];
schedule.scheduleJob(rule, async() => {
    console.log("重启时间", new Date().toLocaleString());
    await refresh();
});
refresh();