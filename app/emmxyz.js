let cheerio = require('cheerio'),
    request = require("request-promise"),
    { URL_EMMXYZ: EMMXYZ, SINAURL: SINA } = require('../config');

let weibo = require("../main");

const {
    Image,
    Album,
    Picture
} = require("../lib/model");
    


const main = async ()=>{
    let index = 1; // 自增页数
    let flag = true;
    while(flag){
        let datas = await request({
            url: `${EMMXYZ}/api/v1/belles?pageSize=20&pageNumber=${index}&_=1555818841661`,
            headers: {
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "pragma": "no-cache",
                "referer": EMMXYZ,
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
                "vid": "d3d3LmVtbXh5ei5jb20=",
                "x-requested-with": "XMLHttpRequest"
            }
        });
        if(datas.length){
            let i = 0;
            while(i<datas.length){
                let data = datas[i];
                let album = await Album.findOne({
                    where: {
                        name: data.Title
                    }
                });
                if(!album){
                    let result;
                    try {
                        result = await weibo.uploadImg(`${EMMXYZ}${data.Image}`);
                    } catch (e) {
                        console.log('cookie error', result)
                        weibo.TASK && weibo.TASK.cancel();
                        await weibo.loginto();
                        result = await weibo.uploadImg(`${EMMXYZ}${data.Image}`);
                    }
                    album = await Album.create({
                        name: data.Title,
                        album_url: `${EMMXYZ}${data.URL}`,
                        url: `${EMMXYZ}${data.Image}`,
                        sina_url: `http://ww1.sinaimg.cn/large/${result.pid}.jpg`,
                        width: result.width,
                        height: result.height,
                        create_time: new Date(data.CreatedAt),
                        category: 'emmxyz'
                    });
                };

                let $ = await request({
                    url: `${EMMXYZ}${data.URL}`,
                    headers: {
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "referer": EMMXYZ,
                        "upgrade-insecure-requests": 1,
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
                    },
                    transform:body => {
                        return cheerio.load(body);
                    }
                });

                $('script').each((i, ele)=>{
                    let html = $(ele).htm();
                    if(html){
                        eval(html);
                        let j=0;
                        while(j < images.length) {
                            let picture = await Picture.findOne({
                                where: {
                                    name: `${data.Title}_${j}`
                                }
                            });
                            if(!picture){
                                let result;
                                try {
                                    result = await weibo.uploadImg(EMMXYZ+images[j]);
                                } catch (e) {
                                    console.log('cookie error', result);
                                    weibo.TASK && weibo.TASK.cancel();
                                    await weibo.loginto();
                                    result = await weibo.uploadImg(EMMXYZ+images[j]);
                                }
                                if (result.pid) {
                                    await Image.create({
                                        name: `${data.Title}_${j}`,
                                        album_id: album.album_id,
                                        width: result.width,
                                        height: result.height,
                                        album_name: data.Title,
                                        sina_url: `http://ww1.sinaimg.cn/large/${result.pid}.jpg`,
                                        url: EMMXYZ+images[j],
                                        create_time: new Date(),
                                        tags: [$('#title span').eq(0).text().split(':').pop().trim()]
                                    }).catch(err => {
                                        console.log(err);
                                    })
                                }
                            }
                        }
                    }    
                });
                i++;
            }
        }else{
            flag = false;
        }
    }
}

main();