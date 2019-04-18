const puppeteer = require('puppeteer'),
    Redis = require('ioredis'),
    schedule = require('node-schedule'),
    fs = require("fs"),
    axios = require('axios'),
    querystring = require('querystring'),
    readline = require('readline');
const URL1 = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog',
    URL2 = '',
    URL3 = 'https://sm.ms/api/upload?inajax=1&ssl=1';

let readSyncByRl = (tips) => {
    tips = tips || '>';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    })
}

class WeiBo {
    constructor(config) {
        this.user = config.user;
        this.pwd = config.pwd;
        this.client_id = config.client_id;
        this.TASK = '';
    }

    async login() {
        const browser = await puppeteer.launch({
            // headless: false,
            slowMo: 250,
            executablePath: ''
        });
        const page = (await browser.pages())[0];
        await page.setViewport({
            width: 1280,
            height: 800
        });
        await page.goto('https://weibo.com/');
        await page.waitForNavigation();
        await page.type('#loginname', this.user, { delay: 100 });
        await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input", this.pwd, { delay: 100 });
        await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
        await page.waitForNavigation().then(result => {
            return new Promise((resolve) => {
                page.cookies().then(async cookie => {
                    console.log('登陆成功！', new Date());
                    fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");//存储cookie
                    await browser.close();//关闭打开的浏览器
                    resolve(cookie);
                });
            })
        }).catch(e => {
            page.screenshot({
                path: 'code.png',
                type: 'png',
                x: 800,
                y: 200,
                width: 100,
                height: 100
            });
            return new Promise((resolve, reject) => {
                readSyncByRl("请输入验证码").then(async (code) => {
                    await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.verify.clearfix > div > input", code);
                    await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
                    await page.waitForNavigation();
                    page.cookies().then(async cookie => {
                        console.log('2222222222');
                        fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");
                        await browser.close();
                        resolve(cookie);
                    });
                })
            })
        })
    }

    async loginto() {
        await this.login();
        const rule = new schedule.RecurrenceRule();
        rule.hour = [8, 16, 23];
        rule.minte = [0];
        this.TASK = schedule.scheduleJob(rule, async () => {
            await this.login();
        });
    }

    // 获取cookie
    async getCookie() {
        return new Promise((resolve, reject) => {
            fs.readFile('cookie.txt', 'utf8', (err, data) => {
                if (err) {
                    reject("获取本地cookie失败！" + err);
                } else {
                    let str = JSON.parse(data).reduce((s, item) => {
                        s += `${item.name}=${item.value};`;
                        return s;
                    }, '');
                    resolve(str);
                }
            })
        })
    }

    // 将图片转为base64
    async imgToBuffer(url) {
        let http;
        if (url.includes('https')) {
            http = require('https');
        } else {
            http = require('http');
        }
        return new Promise((resolve, reject) => {
            http.get(url, res => {
                let chunks = [], size = 0;
                res.on('data', chunk => {
                    chunks.push(chunk);
                    size += chunk.length;
                });
                res.on('end', err => {
                    let data = Buffer.concat(chunks, size);
                    resolve(data);
                })
            })
        })
    }

    async uploadImg(url) {
        let imgBuffer = await this.imgToBuffer(url);
        let res = await this.sinaimg(imgBuffer.toString('base64'));
        res['url'] = url;
        return res;
    }

    async sinaimg(b64_data) {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        let result = await axios.post(URL1, querystring.stringify({ b64_data: b64_data }), {
            withCredentials: true,
            headers: {
                "Cookie": await this.getCookie(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
            }
        });
        try {
            result = JSON.parse(result.data.replace(/([\s\S]*)<\/script>/g, ''))['data']['pics']['pic_1'];
            return {
                width: result['width'],
                height: result['height'],
                pid: result['pid'],
            };
        } catch (error) {
            throw new Error();
        }
    }
}

module.exports = WeiBo;