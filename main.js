const WeiBo = require('./weibo'),
    config = require('./config');

let weibo = new WeiBo(config);
const urls = ['https://img.onvshen.com:85/gallery/21021/25001/s/037.jpg', 'https://img.onvshen.com:85/gallery/21021/25001/s/036.jpg'];


module.exports = weibo;

(async () => {
    await weibo.getCookie().catch(async e => {
        console.log('cookie error', e);
        await weibo.loginto();
    })
    const promiseArray = urls.map(async item => {
        try {
            return await weibo.uploadImg(item);
        } catch (e) {
            weibo.TASK && weibo.TASK.cancel();
            await weibo.loginto();
        }
    })

    Promise.all(promiseArray).then(async (data) => {
        console.log('333', data);
    }).catch(async (e) => {
        console.log(e);
    })
})()