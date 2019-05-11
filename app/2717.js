let cheerio = require("cheerio"),
    request = require("request-promise"),
    iconv = require('iconv-lite'),
    { URL_2717: URL } = require("../config");

const {
    Album,
    Tupian
} = require("../lib/model");

const COOKIE = "adClass0803=18; adClass0803=1; Hm_lvt_d6af4abc8836cbe6ecc10163af1ed92e=1557565607,1557565978,1557566051; Hm_lpvt_d6af4abc8836cbe6ecc10163af1ed92e=1557570200";
const PATH = "/ent/meinvtupian/";
let flag = 1;

const getAlbums = async (url) => {
    let $, albums = [];
    try {
        $ = await request({
            url,
            headers: {
                Cookie: COOKIE,
                Referer: URL + PATH,
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            encoding: null,
            transform: body => {
                body = iconv.decode(body, 'gb2312')
                return cheerio.load(body, { decodeEntities: false });
            }
        })
    } catch (e) {
        console.error(1, e);
    }
    if ($ && $('.MeinvTuPianBox').html()) {
        $('.MeinvTuPianBox ul li .MMPic').each((o, ele) => {
            let album_url = URL + $(ele).attr('href');
            let $img = $(ele).find('img');
            albums.push({
                album_url,
                url: $img.attr('src'),
                name: $img.attr('alt'),
                width: $img.attr('width'),
                height: $img.attr('height')
            })
        })
    }
    return albums;
}

const handleImages = async (album_url) => {
    let images = [], i = 1, b = album_url.split('.');
    let fn = async (url) => {
        let $;
        try {
            $ = await request({
                url,
                headers: {
                    Cookie: COOKIE,
                    Referer: URL + PATH,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                encoding: null,
                transform: (body) => {
                    body = iconv.decode(body, 'gb2312')
                    return cheerio.load(body, { decodeEntities: false });
                }
            }).catch(e => {

            });
            if ($ && $('#picBody').html()) {
                let name = $('#picBody a img').attr('alt'),
                    src = $('#picBody a img').attr('src');
                images.push({ name, src });
                i++;
                let a = [...b];
                a[2] = a[2] + '_' + i;
                await fn(a.join('.'));
            }
        } catch (e) {
            console.error(2, e);
        }
    }
    await fn(album_url);
    return images;
}

const handlePage = async (url) => {
    let albums = await getAlbums(url);
    let n = 0;
    while (n < albums.length) {
        let item = albums[n];
        let album = await Album.findOrCreate({
            where: { name: item.name },
            defaults: {
                album_url: item.album_url,
                url: item.url,
                width: item.width,
                height: item.height,
                create_time: new Date(),
                category: '2717',
                tags: ['美女图片']
            }
        });
        let images = await handleImages(item.album_url);
        let m = 0;
        while (m < images.length) {
            let image = images[m];
            await Tupian.findOrCreate({
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
        console.log(item.name, flag);
        if (flag > 1000) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    flag = 0;
                    console.log(new Date().toLocaleString());
                    resolve(null);
                }, 1.5 * 60 * 60 * 1000);
            });
        }
        flag++;
        n++;
    }
}

const main = async (_url, number) => {
    let n = 1;
    while (n < number) {
        let url;
        if (n === 1) {
            url = _url;
        } else {
            url = _url + `list_11_${n}.html`;
        }
        await handlePage(url);
        n++;
    }
}

const init = async () => {
    let $ = await request({
        url: URL + PATH,
        headers: {
            Cookie: COOKIE,
            Referer: URL + PATH,
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
        },
        transform: body => {
            return cheerio.load(body);
        }
    });
    if ($ && $('.NewPages').html()) {
        let number = $('.NewPages ul li').last().find('a').attr("href").split('.')[0].split('_').pop();
        await main(URL + PATH, number);
    }
}
init();