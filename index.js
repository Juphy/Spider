let cheerio = require('cheerio'),
    request = require('request-promise'),
    iconv = require('iconv-lite');

const URL = 'https://imgchr.com';
const get_html = async() => {
    let $;
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
                // body = iconv.decode(body, 'utf-8');
                // return cheerio.load(body, { decodeEntities: true });
                return cheerio.load(body);
            }
        });
        $('script').each((i, item) => {
            if ($(item).html().includes('token')) {
                console.log($(item).html());

            }
        })
    } catch (error) {
        console.log(error);
    }
}

(async() => {
    await get_html();
})();