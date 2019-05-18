let cheerio = require('cheerio'),
    request = require("request-promise"),
    iconv = require('iconv-lite'),
    schedule = require('node-schedule'),
    { URL_MM: MM } = require("../config");

const {
    Img,
    Album
} = require("../lib/model");
const COOKIE = 'BAIDU_SSP_lcr=https://www.baidu.com/link?url=3ZfMKybjIdbAdgkxSZZ6Npzb5qIWhXAoVIMvLZ6yWrOBHRw3h05iYYPHWimhDffy&wd=&eqid=dc66308400005f04000000025cdc2bc1; Hm_lvt_492109f03bd65de28452325006c4a53c=1557933010; security_session_verify=1faa4d2e1295af7cb576dce0630d54e5; Hm_lpvt_492109f03bd65de28452325006c4a53c=1557933529';
let tags = ['/meinvtag2_1.html',
    "/meinvtag3_1.html",
    '/meinvtag4_1.html',
    '/meinvtag5_1.html',
    "/meinvtag6_1.html",
    '/meinvtag7_1.html',
    "/meinvtag8_1.html",
    "/meinvtag26_1.html",
    "/meinvtag28_1.html",
    "/meinvtag29_1.html",
    "/meinvtag30_1.html",
    "/meinvtag31_1.html",
    "/meinvtag32_1.html",
    "/meinvtag33_1.html",
    "/meinvtag34_1.html",
    "/meinvtag35_1.html",
    "/meinvtag43_1.html",
    "/meinvtag46_1.html",
    "/meinvtag47_1.html"
];
let number = 0;
const getAlbums = async(url) => {
    let $, albums = [];
    try {
        $ = await request.get({
            url,
            headers: {
                Cookie: COOKIE,
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            transform: body => {
                return cheerio.load(body);
            }
        })
    } catch (e) {
        console.error(1, e);
    }
    if ($ && $('.Left_bar').html()) {
        $('.Left_bar .clearfix li a').each((i, ele) => {
            let $img = $(ele).find('img');
            albums.push({
                album_url: $(ele).attr('href'),
                url: $img.attr('data-original'),
                name: $img.attr('alt'),
            })
        });
        albums['NEXT'] = $('.pages .next').attr('href');
    }
    return albums;
}

const handelImages = async(album_url) => {
    // console.log(album_url);
    let images = [],
        i = 1;
    let flag = album_url.split('/').pop().split('.')[0];
    // console.log(flag);
    let fn = async(url) => {
        let $;
        try {
            $ = await request({
                url,
                headers: {
                    Cookie: COOKIE,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                transform: (body) => {
                    return cheerio.load(body);
                }
            }).catch(e => {

            });

            if ($ && $("#pic-meinv").html()) {
                let src = $('#pic-meinv img').attr('data-original'),
                    name = $('.ptitle h1').text() + "(" + i + ")";
                images.push({
                    name,
                    src
                });
                let href = $('.pic-next div a').attr('href');
                if (href.includes(flag)) {
                    i++;
                    await fn(href);
                } else {
                    let tag = [];
                    $('.label a').each((i, ele) => {
                        tag.push($(ele).text());
                        let href = '/' + $(ele).attr('href').split('/').pop();
                        if (tag.indexOf(href) < 0) {
                            tags.push(href);
                        }
                    });
                    images['TAGS'] = tag;
                }

            }
        } catch (e) {
            console.error(2, e);
        }
    }
    await fn(album_url);
    return images;
}

const main = async(url) => {
    let albums = await getAlbums(url);
    // console.log(albums);
    let n = 0;
    while (n < albums.length) {
        let item = albums[n];
        let album = await Album.findOrCreate({
            where: { name: item.name },
            defaults: {
                album_url: item.album_url,
                url: item.url,
                create_time: new Date(),
                category: 'win',
                tags: []
            }
        });
        if (album[1]) {
            let tag = images['TAGS'];
            if (tag.includes('明星') ||
                tag.includes('小鲜肉') ||
                tag.includes('电视剧') ||
                tag.includes('剧照') ||
                tag.includes('海报') ||
                tag.includes("帅气") ||
                tag.includes("小生") ||
                tag.includes("帅哥") ||
                tag.includes('男')
            ) {
                await Album.destroy({
                    where: {
                        id: album[0].id
                    }
                });
            } else {
                let images = await handelImages(item.album_url);
                album[0].update({
                    tags: tag
                })
                let m = 0;
                while (m < images.length) {
                    let image = images[m];
                    await Img.findOrCreate({
                        where: {
                            name: image.name
                        },
                        defaults: {
                            album_id: album[0].id,
                            album_name: item.name,
                            url: image.src
                        }
                    });
                    m++;
                }
                number++;
            }
        } else {
            let $;
            try {
                $ = await request({
                    url: album[0].album_url,
                    headers: {
                        Cookie: COOKIE,
                        "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                    },
                    transform: (body) => {
                        return cheerio.load(body);
                    }
                }).catch(e => {

                });

                if ($ && $("#pic-meinv").html()) {
                    $('.label a').each((i, ele) => {
                        let href = '/' + $(ele).attr('href').split('/').pop();
                        if (tags.indexOf(href) < 0) {
                            tags.push(href);
                        }
                    });
                }
            } catch (e) {
                console.error(2, e);
            }
            let tag = album[0].tags;
            if (tag.includes('明星') ||
                tag.includes('小鲜肉') ||
                tag.includes('电视剧') ||
                tag.includes('剧照') ||
                tag.includes('海报') ||
                tag.includes("帅气") ||
                tag.includes("小生") ||
                tag.includes("帅哥") ||
                tag.includes('男')
            ) {
                let album_id = album[0].id;
                await Img.destroy({
                    where: {
                        album_id
                    }
                });
                await Album.destroy({
                    where: {
                        id: album_id
                    }
                });
            }
        }
        console.log(item.name, number);
        if (number > 1000) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    number = 0;
                    console.log(new Date().toLocaleString());
                    resolve(null);
                }, 1.5 * 60 * 60 * 1000);
            });
        }
        n++;
    }
}

const init = async() => {
    let i = 0;
    while (i < tags.length) {
        await main(MM + tags[i])
        i++;
    }
    console.log(tags);
}

const rule = new schedule.RecurrenceRule();
rule.hour = [8];
rule.minute = [0];
rule.second = [0];
schedule.scheduleJob(rule, async() => {
    number = 1;
    console.log("重启时间", new Date().toLocaleString());
    init();
})
init();