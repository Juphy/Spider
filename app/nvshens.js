let cheerio = require('cheerio'),
    schedule = require('node-schedule'),
    request = require("request-promise"),
    { URL_GALLERY: GALLERY, URL_NVSHEN: NVSHEN, COOKIE, HOST } = require('../config');

let weibo = require("../main");

const {
    Image,
    Album
} = require("../lib/model");

let index = 1; // 自增页数
let number = 0; // 用于计数，超过5000休息两小时

// 获取相册
const getAlbum = async(url) => {
    let $;
    let albums = [];
    try {
        $ = await request({
            url: url,
            headers: {
                "Connection": "keep-alive",
                "DNT": 1,
                "Host": HOST,
                "Referer": GALLERY,
                "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
            },
            transform: (body) => {
                return cheerio.load(body);
            }
        });
        if ($('#listdiv ul').html()) {
            $('#listdiv ul li').each((i, item) => {
                let link = $(item).find('.galleryli_link').attr("href"),
                    title = $(item).find('.galleryli_link img').attr("alt"),
                    cover = $(item).find('.galleryli_link img').attr("data-original");
                albums.push({
                    name: title,
                    album_url: NVSHEN + link,
                    url: cover
                })
            });
        }
    } catch (e) {
        console.log(e);
    }
    return albums;
}

// 处理相册
const handleAlbums = async(albums) => {
    const datas = [];
    // 以下方法强行同步，以便读表与写表
    let i = 0;
    while (i < albums.length) {
        let item = albums[i];
        let $ = await request({
            url: item.album_url,
            headers: {
                "Connection": "keep-alive",
                DNT: 1,
                Host: HOST,
                Pragma: "no-cache",
                Referer: GALLERY,
                "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 73.0.3683.103 Safari / 537.36"
            },
            transform: (body) => {
                return cheerio.load(body);
            }
        });
        let tags = [];
        if ($('#hgallery').html()) {
            $('#utag li a').each(async(i, ele) => {
                tags.push($(ele).text());
            })
        }

        let result;
        try {
            result = await weibo.uploadImg(item.url);
        } catch (e) {
            console.log('cookie error', result)
            weibo.TASK && weibo.TASK.cancel();
            await weibo.loginto();
            result = await weibo.uploadImg(item.url);
        }
        if (result.pid && result.width && result.height) {
            let _album = await Album.findOrCreate({
                where: {
                    name: item.name
                },
                defaults: {
                    album_url: item.album_url,
                    url: item.url,
                    sina_url: `https://ww1.sinaimg.cn/large/${result.pid}.jpg`,
                    width: result.width,
                    height: result.height,
                    create_time: new Date(),
                    category: 'nvshens',
                    table: "web_images1",
                    tags: tags
                }
            });
            let album = _album[0];
            if (_album[1]) {
                await album.update({
                    tags: tags
                })
            }
            datas.push({
                album_url: item.album_url,
                album_id: album.id,
                album_name: album.name
            })
        }
        i++;
    }
    return datas;
}

// 获取分页图片合集
const getPage = async(album_url) => {
    let imgs = [],
        index = 1;
    let fn = async(url) => {
        let $;
        try {
            $ = await request({
                url: url,
                headers: {
                    "Connection": "keep-alive",
                    DNT: 1,
                    Host: HOST,
                    Pragma: "no-cache",
                    Referer: GALLERY,
                    "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 73.0.3683.103 Safari / 537.36"
                },
                transform: (body) => {
                    return cheerio.load(body);
                }
            });
            if ($('#hgallery').html()) {
                $("#hgallery").children().each(async(i, ele) => {
                    imgs.push({
                        name: $(ele).attr('alt'),
                        src: $(ele).attr("src"),
                    })
                });
                index++;
                await fn(album_url + `${index}.html`);
            }
        } catch (e) {
            console.log(e);
        }
    };
    await fn(album_url);
    return imgs;
}

const getImgs = async(datas) => {
    // 同步操作
    let n = 0;
    while (n < datas.length) {
        let item = datas[n];
        let images = await getPage(item.album_url);
        let i = 0;
        while (i < images.length) {
            let img = images[i];
            let result;
            try {
                result = await weibo.uploadImg(img.src);
            } catch (e) {
                console.log('cookie error', result);
                weibo.TASK && weibo.TASK.cancel();
                await weibo.loginto();
                result = await weibo.uploadImg(img.src);
            }
            if (result.pid && result.width && result.height) {
                number++;
                let image = await Image.findOrCreate({
                    where: { name: img.name },
                    defaults: {
                        album_id: item.album_id,
                        width: result.width,
                        height: result.height,
                        album_name: item.album_name,
                        sina_url: `https://ww1.sinaimg.cn/large/${result.pid}.jpg`,
                        url: img.src
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
            i++;
        };
        n++;
    }
}

const main = async(url, URL) => {
    const albums = await getAlbum(url);
    if (albums.length && index <= 20) {
        // if (albums.length) {
        const datas = await handleAlbums(albums);
        await getImgs(datas);
        index++;
        await main(`${URL}${index}.html`, URL);
    } else {
        console.log('xxxxxxxxxxxxxxxx');
    }
}

const getAllTags = async(url) => {
    let tags = [];
    try {
        let $ = await request({
            url: url,
            headers: {
                "Connection": "keep-alive",
                "DNT": 1,
                "Host": HOST,
                "Referer": GALLERY,
                "User-Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
            },
            transform: (body) => {
                return cheerio.load(body);
            }
        });
        if ($ && $('.tag_div').html()) {
            $('.tag_div ul li a').each(async(i, item) => {
                tags.push($(item).attr('href'));
            });
        }
    } catch (e) {
        console.log(e);
    }

    return tags;
}


const init = async() => {
    const tags = await getAllTags(GALLERY);
    let i = 17;
    while (i < tags.length) {
        console.log(i, tags[i]);
        let url = NVSHEN + tags[i];
        await main(url, url);
        index = 1;
        if (number > 3000) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    number = 0;
                    resolve(null);
                }, 60 * 60 * 1000);
            });
        }
        number = 0;
        i++;
    }
}

// init();
main(GALLERY, GALLERY);
const rule = new schedule.RecurrenceRule();
rule.hour = [3, 15];
rule.minute = [0];
rule.second = [0];
schedule.scheduleJob(rule, async() => {
    number = 0;
    await main(GALLERY, GALLERY);
})