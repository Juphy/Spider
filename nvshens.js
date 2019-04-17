let cheerio = require('cheerio'),
    request = require("request-promise"),
    { URL_NVSHEN: URL } = require('./config');

console.log(URL);

let index = 1;

// 获取相册
const getAlbum = async (url) => {
    let data = {
        url,
        res: await request({
            url: url,
            headers: {
                "DNT": 1,
                "Host": "www.nvshens.com",
                "User- Agent": "Mozilla/ 5.0(Windows NT 10.0; Win64; x64) AppleWebKit/ 537.36(KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36"
            }
        })
    };
    return data;
}

const main = async (url) => {
    const data = await getAlbum(url);
}