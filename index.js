let cheerio = require('cheerio'),
    request = require('request-promise'),
    iconv = require('iconv-lite');
let imgur = require('./main');
const URL = 'https://imgchr.com';
const get_html = async () => {
    let $, token, _$;
    try {
        $ = await request({
            url: URL,
            headers: {
                Referer: URL,
                "User-Agent": "Mozilla/5.0(Windows NT 10.0; Win64; x64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/75.0 .3770 .100",
                Cookie: "_ga = GA1 .2 .2141393046 .1562813421;PHPSESSID = msp45n1qovvkub21lan4ldhg2n;Hm_lvt_8bb45b8b013c8d4f9a20752d5e7465e4 = 1562813531, 1562850482, 1562919907,        1563156752;_gid = GA1 .2 .1176736500 .1563156752;Hm_lpvt_8bb45b8b013c8d4f9a20752d5e7465e4 = 1563156766",
                Host: 'imgchr.com',
                Accept: "text/html, application/xhtml + xml, application/xml;q = 0.9, image/webp, image/apng, */*;q=0.8,application/signed-exchange;v=b3"
            },
            encoding: 'utf-8',
            transform: (body) => {
                return cheerio.load(body);
            }
        });
        $('script').each((i, item) => {
            let html = $(item).html();
            if (html.includes('token')) {
                let reg = /token\s=\s"(?:[^"\\]|\\.)*"/;
                eval(reg.exec(html)[0]);
            }
        });
        console.log(token);
    } catch (error) {
        console.log(error);
    }

    try {
        _$ = await request({
            method: 'POST',
            uri: URL + '/json',
            body: {
                "source": 'https://www.bing.com/th?id=OHR.HemingwayHome_EN-CN3681259121_1920x1080.jpg',
                "type": "url",
                "action": "upload",
                "timestamp": new Date().getTime(),
                "auth_token": token,
                "nsfw": 0
            },
            json: true,
            headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data;boundary=----WebKitFormBoundaryREbErPsKrV5nUb8w",
                DNT: 1,
                Origin: "https: //imgchr.com",
                "User-Agent": "Mozilla/5.0(Windows NT 10.0; Win64; x64) AppleWebKit/537.36(KHTML, like Gecko) Chrome/75.0 .3770 .100"
            },
            transform: (body) => {
                console.log(123, body);
                return cheerio.load(body);
            }
        })
    } catch (error) {
        console.log(456, error);
    }
}

const get_image = async (hash) => {
    let result;
    try {
        result = await imgur.get_image(hash);
    } catch (error) {
        result = error;
    }
    console.log(result);
}

const upload_image = async (image, type, title) => {
    let result;
    try {
        result = await imgur.upload_image(image, type, title);
    } catch (error) {
        result = error;
    }
    console.log(result);
}
const get_credits = async () => {
    let result;
    try {
        result = await imgur.get_credits();
    } catch (error) {
        result = error;
    }
    console.log(result);
}
// get_image('aP7PrN1');

// upload_image('https://lh3.googleusercontent.com/WFmjwc3jRmZaRoqcIwFlbjE2p7jcA48kiMAt_6MVakjs9n9cq95S-0BtKT2V983XcEdBDoLsQZYlnhxB24L-cQN_nont2PKUkrMhQb9I0dL4ocBu52e8w8G8kNkBkoRDE-9k2cFVgY1Ov0gppfZDNSl2vvRqYhfyDwG1QwnEiyoYpCa7ni4ip7tTg4O4Q13PztsMiNsC_6GLDwg0Ih9f4Qf-u5jYCH445iYAG9SRn3baZlXsIsvBEfGuxlubpdan5XNXoek7e9lD8FMMy7YZNu2rUUuXulcvjxpJtZjWgvwMK7Ik6ABpPLbAJEI8WpmRqBFA5yKlNw2DPidGYmisw-qiszljHA5CJuXVyHxhqO7kq5l1IOcUDuy1p1nCbq6xJBokElDIpbdvbapGfVHPmQHJUDtHIHk7gJ4JCgNZyNouT7p8iYYjetxO-VsSTiAsUyf8EsoXZPYqXi3nzZvjQVh-9J1mhTwP6dYtTtNnDPQTNfnVZwFUl61kAE9YwX6Oo69bB_ns-LBCo2XvO_Be21buztLRmEGA4N0WsclIwWIeB_JD8gH-O16lKlMMM8yjFv54G9cIBZt92eC21uPtjzXlkvgSREO5qdtXhM9nlXPAUOaDAD0t8YfGSY9Tb8cr5dIgqbNPubC_zRNsuWxsjyC_tSQUQE8nSsJGZBCLFSRp5uva9w5IaQ=w921-h1283-no', 'URL', 'test');

// get_credits();
const favorite_image = async (hash) => {
    let result;
    try {
        result = await imgur.favorite_image(hash);
    } catch (error) {
        reult = error;
    }
    console.log(result);
}
// favorite_image('aP7PrN1')

const account_images = async () => {
    let result;
    try {
        result = await imgur.account_images();
    } catch (error) {
        reult = error;
    }
    console.log(result);
}
// account_images();

const account_base = async () => {
    let result;
    try {
        result = await imgur.account_base();
    } catch (error) {
        reult = error;
    }
    console.log('》》》》》》》', result);
}
// account_base();

const get_albums = async () => {
    let result;
    try {
        result = await imgur.get_albums();
    } catch (error) {
        reult = error;
    }
    console.log(result);
}
// get_albums();

const {
    Bing
} = require("./lib/model");
const Sequelize = require("sequelize"),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    async = require('async'),
        path = require('path'),
        Bagpipe = require('bagpipe');
const Op = Sequelize.Op;
var bagpipe = new Bagpipe(1);


var downloadImage = function (src, dest, callback) {
    request.head(src, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        if (src) {
            request(src).pipe(fs.createWriteStream(dest)).on('close', function () {
                callback(null, dest);
            });
        }
    });
};

const list = async (page = 1) => {
    let pagesize = 16;
    let res = await Bing.findAll({
        offset: (page - 1) * pagesize,
        limit: pagesize
    });
    if (res.length) {
        for (let i = 0; i < res.length; i++) {
            let bing = res[i];
            let imgPath = bing.name.split(' (')[0] + '.jpg';
            bagpipe.push(downloadImage, bing.url, path.resolve('/home/GoogleDrive/bings/' + imgPath.replace(/\//g, '-')), (err, data) => {
                // bagpipe.push(downloadImage, bing.url, path.join('./bing/' + imgPath.replace(/\//g, '-')), (err, data) => {
                console.log(data)
            });
        }
        page++;
        await list(page);
    }
}
list();