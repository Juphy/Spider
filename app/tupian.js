let cheerio = require("cheerio"),
    request = require("request-promise"),
    iconv = require('iconv-lite'),
    { URL_2717: URL1, URL_mmonly: URL2, URL_gtmm: URL3, URL_tp8: URL4 } = require("../config");

const {
    Album,
    Tupian
} = require("../lib/model");

const COOKIE = ["adClass0803=18; adClass0803=1; Hm_lvt_d6af4abc8836cbe6ecc10163af1ed92e=1557565607,1557565978,1557566051; Hm_lpvt_d6af4abc8836cbe6ecc10163af1ed92e=1557570200",
    "Hm_lvt_418404b216c475621299c2d1de88748a=1557575721; Hm_lpvt_418404b216c475621299c2d1de88748a=1557589452",
    "UM_distinctid=16aa6bccfc22c9-0db8c8eb6d4ab5-6353160-100200-16aa6bccfc3270; __51cke__=; Hm_lvt_5f71360d4e4b92b6287018e6313c6633=1557575022,1557581928; CNZZDATA3482847=cnzz_eid%3D1278992741-1557575530-%26ntime%3D1557586407; __tins__6747931=%7B%22sid%22%3A%201557590406331%2C%20%22vd%22%3A%201%2C%20%22expires%22%3A%201557592206331%7D; __51laig__=30; Hm_lpvt_5f71360d4e4b92b6287018e6313c6633=1557590406",
    "UM_distinctid=16aa71e432161-0c2acb4ffa6751-6353160-100200-16aa71e4322192; Hm_lvt_5bebaeb4f49618f50265b2e764e4b5d8=1557581940; CNZZDATA1275074800=155059152-1557580986-https%253A%252F%252Fwww.aitaotu.com%252F%7C1557588710; Hm_lpvt_5bebaeb4f49618f50265b2e764e4b5d8=1557588709",
    "UM_distinctid=16aa71e432161-0c2acb4ffa6751-6353160-100200-16aa71e4322192; Hm_lvt_5bebaeb4f49618f50265b2e764e4b5d8=1557581940; CNZZDATA1275074800=155059152-1557580986-https%253A%252F%252Fwww.aitaotu.com%252F%7C1557588710; Hm_lpvt_5bebaeb4f49618f50265b2e764e4b5d8=1557588709"];
const URLs = [URL1, URL2, URL3, URL4, URL4];
const PATHs = ["/ent/meinvtupian/", '/mmtp/', '/xgmn/', '/yule/meinv/', '/yule/rentiyishu/'];
const categorys = ['2717', 'mmonly', 'gtmm', 'tp8', 'tp8'];
let flag = 1;
let URL, N = 0;

const getAlbums = async (url) => {
    let $, albums = [];
    try {
        let option = {
            url,
            headers: {
                Cookie: COOKIE[N],
                Referer: URL,
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            encoding: null,
            transform: body => {
                if (N !== 3 && N !== 4) {
                    body = iconv.decode(body, 'gb2312');
                    return cheerio.load(body, { decodeEntities: false });
                } else {
                    body = iconv.decode(body, 'utf8');
                    return cheerio.load(body, { decodeEntities: false });
                }
            }
        }
        $ = await request(option);
    } catch (e) {
        console.error(1, e);
    }
    switch (N) {
        case 0:
            if ($ && $('.MeinvTuPianBox').html()) {
                $('.MeinvTuPianBox ul li .MMPic').each((o, ele) => {
                    let album_url = URLs[N] + $(ele).attr('href');
                    let $img = $(ele).find('img');
                    albums.push({
                        album_url,
                        url: $img.attr('src'),
                        name: $img.attr('alt'),
                        width: $img.attr('width'),
                        height: $img.attr('height'),
                        tags: ['美女图片']
                    })
                })
            }
            break;
        case 1:
            if ($ && $('#infinite_scroll').html()) {
                $('#infinite_scroll .item').each((o, ele) => {
                    let album_url = $(ele).find('.ABox a').attr('href'),
                        $img = $(ele).find('.ABox a img');
                    albums.push({
                        album_url,
                        url: $img.attr('src'),
                        name: $img.attr('alt'),
                        width: $img.attr('width'),
                        tags: [$(ele).find('.items_comment a').last().text()]
                    })
                })
            }
            break;
        case 2:
            if ($ && $('.listPic').html()) {
                $('.listPic ul li a').each((o, ele) => {
                    let album_url = URLs[N] + $(ele).attr('href'),
                        $img = $(ele).find('img');
                    albums.push({
                        album_url,
                        url: URLs[N] + $img.attr('src'),
                        name: $img.attr('alt'),
                        tags: ['性感美女']
                    })
                })
            }
            break;
        case 3:
            if ($ && $('.m-list').html()) {
                $('.m-list ul li a').each((o, ele) => {
                    let album_url = URLs[N] + $(ele).attr('href'),
                        $img = $(ele).find('img');
                    albums.push({
                        album_url,
                        url: $img.attr('data-original'),
                        name: $img.attr('alt')
                    })

                })
            }
            break;
        case 4:
            if ($ && $('.m-list').html()) {
                $('.m-list ul li a').each(async (o, ele) => {
                    let album_url = URLs[N] + $(ele).attr('href'),
                        $img = $(ele).find('img');
                    albums.push({
                        album_url,
                        url: $img.attr('data-original'),
                        name: $img.attr('alt')
                    })

                })
            }
            break;
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
                    Cookie: COOKIE[N],
                    Referer: URL,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                encoding: null,
                transform: (body) => {
                    if (N !== 3 && N !== 4) {
                        body = iconv.decode(body, 'gb2312');
                        return cheerio.load(body, { decodeEntities: false });
                    } else {
                        body = iconv.decode(body, 'utf8');
                        return cheerio.load(body, { decodeEntities: false });
                    }
                }
            }).catch(e => {

            });
            let name, src;
            switch (N) {
                case 0:
                    if ($ && $('#picBody').html()) {
                        name = $('#picBody a img').attr('alt') + `(${i})`;
                        src = $('#picBody a img').attr('src');
                    }
                    break;
                case 1:
                    if ($ && $('#big-pic').html()) {
                        name = $('#big-pic a img').attr('alt') + `(${i})`;
                        src = $('#big-pic a img').attr('src');
                    }
                    break;
                case 2:
                    if ($ && $('.imagepic').html()) {
                        name = $('.imagepic img').attr('alt') + `(${i})`;
                        src = URLs[N] + $('.imagepic img').attr('src');
                    }
                    break;
                case 3:
                    if ($ && $('.pic-main').html()) {
                        name = $('.pic-main a img').attr('alt').split(' ')[0] + `(${i})`;
                        src = $('.pic-main a img').attr('src');
                    }
                    break;
                case 4:
                    if ($ && $('.pic-main').html()) {
                        name = $('.pic-main a img').attr('alt').split(' ')[0] + `(${i})`;
                        src = $('.pic-main a img').attr('src');
                    }
                    break;
            }
            if (name && src) {
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
        let tags = [];
        if (N === 3 || N === 4) {
            let $ = await request({
                url: item['album_url'],
                headers: {
                    Cookie: COOKIE[N],
                    Referer: URL,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                encoding: null,
                transform: (body) => {
                    if (N !== 3 && N !== 4) {
                        body = iconv.decode(body, 'gb2312');
                        return cheerio.load(body, { decodeEntities: false });
                    } else {
                        body = iconv.decode(body, 'utf8');
                        return cheerio.load(body, { decodeEntities: false });
                    }
                }
            }).catch(e => {

            })
            $('.pic-l a').each((i, el) => {
                tags.push($(el).text());
            });
        }
        let album = await Album.findOrCreate({
            where: { name: item.name },
            defaults: {
                album_url: item.album_url,
                url: item.url,
                width: item.width,
                height: item.height,
                create_time: new Date(),
                category: categorys[N],
                tags: (N === 3 || N === 4) ? tags : item.tags
            }
        });
        album[0].update({ category: categorys[N] });
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
                }, 60 * 60 * 1000);
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
            switch (N) {
                case 0:
                    url = _url + `list_11_${n}.html`;
                    break;
                case 1:
                    url = _url + `list_9_${n}.html`;
                    break;
                case 2:
                    url = _url + `list_1_${n}.html`;
                    break;
                case 3:
                    url = _url + `list_${n}.html`;
                    break;
                case 4:
                    url = _url + `list_${n}.html`;
                    break;
            }
        }
        await handlePage(url);
        n++;
    }
}

const init = async () => {
    let i = 0;
    while (i < URLs.length) {
        N = i;
        URL = URLs[i] + PATHs[i];
        let $ = await request({
            url: URL,
            headers: {
                Cookie: COOKIE[N],
                Referer: URL,
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            transform: body => {
                return cheerio.load(body);
            }
        });
        let number;
        switch (i) {
            case 0:
                if ($ && $('.NewPages').html()) {
                    number = $('.NewPages ul li').last().find('a').attr("href").split('.')[0].split('_').pop();
                }
                break;
            case 1:
                if ($ && $('#pageNum').html()) {
                    number = $('#pageNum a').last().attr('href').split('.')[0].split('_').pop();
                }
                break;
            case 2:
                if ($ && $('.page').html()) {
                    $('.page ul li').each((o, ele) => {
                        let $a = $(ele).find('a');
                        if ($a.text() === '末页') {
                            number = $a.attr('href').split('.')[0].split('_').pop();
                        }
                    });
                }
                break;
            case 3:
                if ($ && $('.page').html()) {
                    number = $('.page a').last().attr('href').split('.')[0].split('_').pop();
                }
                break;
            case 4:
                if ($ && $('.page').html()) {
                    number = $('.page a').last().attr('href').split('.')[0].split('_').pop();
                }
                break;
        }
        await main(URL, number);
        i++;
    }
}
init();