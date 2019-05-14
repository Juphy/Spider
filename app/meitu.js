let cheerio = require("cheerio"),
    request = require("request-promise"),
    schedule = require('node-schedule'),
    iconv = require('iconv-lite'),
    { URL_lsm: URL } = require("../config");

const {
    Album,
    Meitu
} = require("../lib/model");

const COOKIE = 'pjr5_2132_saltkey=Lz2I3kiI; pjr5_2132_lastvisit=1557644091; Hm_lvt_6a60b923391636750bd84d6047523609=1557647691; pjr5_2132_st_t=0%7C1557647819%7Cd6986f25097a369c39da8e6b9428550f; pjr5_2132_forum_lastvisit=D_133_1557647819; pjr5_2132_visitedfid=40D133; pjr5_2132_viewid=tid_20633; pjr5_2132_st_p=0%7C1557648028%7Cf19b2c8227ff1fa4bc1817123ab41bce; pjr5_2132_sid=N1uyYT; pjr5_2132_sendmail=1; pjr5_2132_lastact=1557660395%09plugin.php%09; Hm_lpvt_6a60b923391636750bd84d6047523609=1557660394';
let flag = 1;

const getAlbums = async(url) => {
    let albums = [];
    try {
        let $ = await request({
            url,
            headers: {
                Cookie: COOKIE,
                Referer: URL,
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
            },
            transform: body => {
                return cheerio.load(body);
            }
        })
        if ($ && $('#index-pic').html()) {
            $('#index-pic .photo a').each((o, ele) => {
                let album_url = URL + '/' + $(ele).attr('href'),
                    $img = $(ele).find('img');
                let alt = $img.attr('alt').split(' ').filter(i => i);
                albums.push({
                    album_url,
                    url: $img.attr('src'),
                    name: alt.join(' '),
                    tags: alt.slice(0, 2)
                })
            });
            let href = $('.pg .vpn').last().attr('href'),
                current = $('.pg .current').text();
            if (Number(current) < Number(href.split('=').pop())) {
                albums['NEXT'] = href;
            }
        }
    } catch (e) {
        console.log(1, e)
    }
    return albums;
}

const handleImages = async(url, name) => {
    let images = [],
        i = 0;
    let fn = async(url) => {
        try {
            let $ = await request({
                url,
                headers: {
                    Cookie: COOKIE,
                    Referer: URL,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
                },
                transform: body => {
                    return cheerio.load(body);
                }
            })
            if ($ && $('#thread-pic').html()) {
                $('#thread-pic ul li img').each((o, ele) => {
                    images.push({
                        url: $(ele).attr('src'),
                        name: name + `(${i * 4 + o + 1})`
                    })
                });
                if (i === 0) {
                    let tags = [];
                    $('#thread-tag a').each((o, ele) => {
                        tags.push($(ele).attr('title'));
                    });
                    images['TAGS'] = tags;
                }
                if ($('.pg .next').html()) {
                    i++;
                    await fn(URL + '/' + $('.pg .next').attr('href'));
                }
            }
        } catch (e) {
            console.log(2, e)
        }
    }
    await fn(url)
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
                category: 'lsm',
                tags: item.tags
            }
        });
        if (album[1]) {
            let images = await handleImages(item.album_url, item.name);
            // console.log(images);
            if (images['TAGS'] !== '[db:标签]') {
                album[0].update({
                    tags: [...item.tags.concat(new Set(images['TAGS']))]
                })
            }
            let m = 0;
            while (m < images.length) {
                let image = images[m];
                await Meitu.findOrCreate({
                    where: {
                        name: image.name
                    },
                    defaults: {
                        album_id: album[0].id,
                        album_name: item.name,
                        url: image.url
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
        }
        n++;
    }
    if (albums['NEXT']) {
        await main(URL + '/' + albums['NEXT']);
    }

}

const rule = new schedule.RecurrenceRule();
rule.hour = [4, 14];
rule.minute = [0];
rule.second = [0];
schedule.scheduleJob(rule, async() => {
    flag = 1;
    console.log("重启时间", new Date().toLocaleString());
    main(URL);
})
main(URL);

// (async() => {
//     let albums = await Album.findAll({
//         where: {
//             category: 'lsm'
//         }
//     });
//     let i = 0;
//     while (i < albums.length) {
//         let album = albums[i];
//         if (album.tags.includes('[db:标签]')) {
//             let tags = album.tags;
//             tags.pop();
//             await album.update({
//                 tags
//             })
//             console.log(i);
//         }
// try {
//     let $ = await request({
//         url: album.album_url,
//         headers: {
//             Cookie: COOKIE,
//             Referer: URL,
//             "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/53'
//         },
//         transform: body => {
//             return cheerio.load(body);
//         }
//     });
//     let title = $('#thread-title h1').text().split(' ').filter(i => i);
//     let name = title.join(' ');
//     let tags = title.slice(0, 2);
//     if (album.tags[0]=== "[db:标签]") {
//         await album.update({
//             name,
//             tags
//         })
//     } else {
//         tags = new Set(tags.concat(album.tags));
//         await album.update({
//             name,
//             tags: [...tags]
//         })
//     }
//     let images = await Meitu.findAll({
//         where: {
//             album_id: album.id
//         }
//     })
//     let n = 0;
//     while (n < images.length) {
//         let image = images[n];
//         await image.update({
//             album_name: name,
//             name: name + '(' + image.name.split('(')[1].split(')')[0] + ')'
//         })
//         n++
//     }
//     console.log(name, i);
// } catch (e) {
//     console.log(e);
// }
//         i++;
//     }
// })()