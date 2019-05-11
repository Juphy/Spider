let cheerio = require('cheerio'),
    request = require("request-promise"),
    iconv = require('iconv-lite'),
    { URL_MM: MM } = require("../config");

const {
    Img,
    Album
} = require("../lib/model");
const COOKIE = 'bdshare_firstime=1557325960765; UM_distinctid=16a98126be31f0-0ea076afdf9712-e323069-100200-16a98126be4eb; CNZZDATA3866066=cnzz_eid%3D2029163044-1494676185-null%26ntime%3D1494676185; Hm_lvt_9a737a8572f89206db6e9c301695b55a=1557325960,1557495175; Hm_lpvt_9a737a8572f89206db6e9c301695b55a=1557507022';

let tags = [, "/qingchun/", '/xiaohua/', '/chemo/', "/qipao/", '/mingxing/', "/xinggan/"];
let tagss = [, '清纯美眉', '美女校花', '性感车模', '旗袍美女', '明星写真', '性感美女'];
let flag = 1;
const getAlbums = async (url) => {
    let $, albums = [];
    try {
        $ = await request.get({
            url,
            headers: {
                Cookie: COOKIE,
                Referer: MM + tags[Math.ceil(Math.random() * (1, 6))],
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
    if ($ && $('.main').html()) {
        $(".main a").each((o, ele) => {
            let $img = $(ele).find("img");
            if ($img.attr('alt')) {
                albums.push({
                    album_url: $(ele).attr('href'),
                    url: $img.attr('src'),
                    name: $img.attr('alt'),
                    width: $img.attr('width'),
                    height: $img.attr('height')
                })
            }
        })
    }
    return albums;
}

const handelImages = async (album_url) => {
    let images = [], i = 1, b = album_url.split('.');
    let fn = async (url) => {
        let $;
        try {
            $ = await request({
                url,
                headers: {
                    Cookie: COOKIE,
                    Referer: MM + tags[Math.ceil(Math.random() * (1, 6))],
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                encoding: null,
                transform: (body) => {
                    body = iconv.decode(body, 'gb2312')
                    return cheerio.load(body, { decodeEntities: false });
                }
            }).catch(e => {

            });
            if ($ && $(".content").html()) {
                let name = $('.content .content-pic img').attr('alt').split('(')[0] + `(${i})`,
                    src = $('.content .content-pic img').attr('src');
                images.push({
                    name, src
                });
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

const handlePgae = async (url, index) => {
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
                category: 'mm131',
                tags: [tagss[index]]
            }
        });
        let images = await handelImages(item.album_url);
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
const main = async (_url, number, index) => {
    let n = 1;
    // while (n < number) {
    while (n < 2) {
        let url;
        if (n === 1) {
            url = _url;
        } else {
            url = _url + `list_${index}_${n}.html`
        }
        await handlePgae(url, index);
        n++;
    }
}

const init = async () => {
    let i = 1;
    // while (i < tags.length) {
    while (i < 2) {
        let url = MM + tags[i];
        let $ = await request({
            url,
            headers: {
                Cookie: COOKIE,
                Referer: MM + tags[Math.ceil(Math.random() * (1, 6))],
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            transform: body => {
                return cheerio.load(body)
            }
        });
        if ($ && $('.main').html()) {
            let number = $('.main .page a').last().attr('href').split('.')[0].split('_').pop();
            await main(url, number, i);
        }
        i++;
    }

}

init();