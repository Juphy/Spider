const {
    Bing
} = require("./lib/model");
const fs = require('fs'),
    path = require('path'),
    Bagpipe = require('bagpipe');
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