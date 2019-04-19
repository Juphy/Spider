// const puppeteer = require('puppeteer');
const request = require("request-promise"),
    // Redis = require("ioredis"),
    schedule = require('node-schedule'),
    fs = require("fs"),
    axios = require('axios'),
    querystring = require('querystring'),
    readline = require('readline'),
    encodePostData = require('./encode_post_data.js');
// const redis = new Redis();

// 以下为用作图床的api
const URL1 = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog',
    URL2 = '',
    URL3 = 'https://sm.ms/api/upload?inajax=1&ssl=1';

// let readSyncByRl = (tips) => {
//     tips = tips || '>';
//     return new Promise((resolve) => {
//         const rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//         rl.question(tips, (answer) => {
//             rl.close();
//             resolve(answer.trim());
//         });
//     })
// }

class WeiBo {
    constructor(config) {
        this.user = config.user;
        this.pwd = config.pwd;
        this.client_id = config.client_id;
        this.TASK = '';


        // 预登陆地址，不带base64编码后的用户名，用于获取登录信息
        this.preLoginUrl = config.preLoginUrl;
        // 登录地址
        this.loginUrl = config.loginUrl;
        // 初始化预登陆数据为空
        this.preLoginData = '';
        // 初始化验证码为空
        this.pinCode = null;
        // 登录状态
        //  this.loginStatus = 0;
    }

    async login() {

        // 由于Centos7 运行puppeteer有问题故停用
        // const browser = await puppeteer.launch({
        //     // headless: false,
        //     slowMo: 250,
        //     executablePath: ''
        // });
        // const page = (await browser.pages())[0];
        // await page.setViewport({
        //     width: 1280,
        //     height: 800
        // });
        // await page.goto('https://weibo.com/');
        // await page.waitForNavigation();
        // await page.type('#loginname', this.user, { delay: 100 });
        // await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input", this.pwd, { delay: 100 });
        // await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
        // await page.waitForNavigation().then(result => {
        //     return new Promise((resolve) => {
        //         page.cookies().then(async cookie => {
        //             console.log('登陆成功！', new Date());
        //             fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");//存储cookie
        //             await browser.close();//关闭打开的浏览器
        //             resolve(cookie);
        //         });
        //     })
        // }).catch(e => {
        //     page.screenshot({
        //         path: 'code.png',
        //         type: 'png',
        //         x: 800,
        //         y: 200,
        //         width: 100,
        //         height: 100
        //     });
        //     return new Promise((resolve, reject) => {
        //         readSyncByRl("请输入验证码").then(async (code) => {
        //             await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.verify.clearfix > div > input", code);
        //             await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
        //             await page.waitForNavigation();
        //             page.cookies().then(async cookie => {
        //                 console.log('2222222222');
        //                 fs.createWriteStream("cookie.txt").write(JSON.stringify(cookie), "UTF8");
        //                 await browser.close();
        //                 resolve(cookie);
        //             });
        //         })
        //     })
        // })

        // 模拟微博登录
        let encodeUserName = encodePostData.encryptUserName(this.user);
        this.preLoginUrl = this.preLoginUrl + `&su=${encodeUserName}`;
        try {
            // 获取预登陆原始数据
            let preLoginInitData = await this.getPreLoginData();
            // 解析预登陆原始数据
            this.preLoginData = await this.parsePreLoginData(preLoginInitData);
            // 是否需要验证码
            if (this.preLoginData['showpin'] == 1) {
                await this.getPinImg();
                this.pinCode = await this.inputPinCode();
            }
            let responseBody = await this.postData();
            let finnalLoginUrl = await this.getFinnalLoginUrl(responseBody);
            return await this.setCookies(finnalLoginUrl);
        } catch (e) {
            console.log(e);
        }
    }

    // 获取cookie
    async setCookies(finnalLoginUrl) {
        return new Promise((resolve, reject) => {
            let j = request.jar();
            request.get({ url: finnalLoginUrl, jar: j }, function (error, reponse, body) {
                let cookies = j.getCookieString(finnalLoginUrl);

                fs.writeFile(__dirname + '/cookies.txt', cookies, (error) => {
                    if (error) {
                        reject(0);
                    }
                    else {
                        resolve(body);
                    }
                });
            })
        })
    }

    // 获取最终重定向后的地址
    getFinnalLoginUrl(responseBody) {
        return new Promise((resolve, reject) => {
            let reg = /location\.replace\((?:"|')(.*)(?:"|')\)/;
            let loginUrl = reg.exec(responseBody)[1];
            let parseLoginUrl = querystring.parse(loginUrl);
            if (parseLoginUrl.retcode == 0) {
                resolve(loginUrl);
            } else if (parseLoginUrl.retcode == 101) {
                reject("登录失败，登录名或密码错误");
            } else if (parseLoginUrl.retcode == 2070) {
                reject("登录失败，验证码错误");
            } else {
                reject("未知错误");
            }
        })
    }

    // post数据到服务器
    async postData() {
        let headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
            'Accept-Language': 'zh-cn',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Connection': 'Keep-Alive'
        };
        let encodeBody = encodePostData.encodePostData(this.user, this.pwd, this.preLoginData.servertime, this.preLoginData.nonce, this.preLoginData.pubkey, this.preLoginData.rsakv, this.pinCode, this.preLoginData['pcid']);
        let options = {
            method: 'POST',
            url: this.loginUrl,
            headers: headers,
            body: encodeBody,
            gzip: true
        };
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    response.setEncoding('utf-8');
                    resolve(response.body);
                }
            })
        })
    }

    //  输入验证码
    inputPinCode() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve, reject) => {
            rl.question('请输入验证码，验证码图片在根目录下\n', (pinCode) => {
                console.log(`你输入的验证码为：${pinCode}`);
                rl.close();
                resolve(pinCode);
            })
        })
    }

    // 如果有验证码则要输入验证码
    async getPinImg() {
        // 构造验证码的url
        let pinImgUrl = `http://login.sina.com.cn/cgi/pin.php?r=${Math.floor(Math.random() * 1e8)}&s=0&p=${this.preLoginData['pcid']}`;
        await request(pinImgUrl).pipe(fs.createWriteStream(__dirname + '/pinCode.png'));
    }

    // 解析获取到的预登陆数据
    async parsePreLoginData(data) {
        return new Promise((resolve, reject) => {
            let reg = /\((.*)\)/;
            let preLoginData = JSON.parse(reg.exec(data)[1]);
            if (preLoginData) {
                resolve(preLoginData);
            } else {
                reject('没有获取到json');
            }
        })
    }

    // 获取预登陆数据
    async getPreLoginData() {
        return new Promise((resolve, reject) => {
            request(this.preLoginUrl, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(response.body);
                } else {
                    reject("没有获取到预登陆数据")
                }
            })
        })
    }

    async loginto() {
        await this.login();
        const rule = new schedule.RecurrenceRule();
        rule.hour = [8, 16, 23];
        rule.minute = [0];
        this.TASK = schedule.scheduleJob(rule, async () => {
            await this.login();
        });
    }

    // 获取cookie
    async getCookies() {
        return new Promise((resolve, reject) => {
            fs.readFile(__dirname + '/cookies.txt', 'utf8', (err, data) => {
                if (err) {
                    reject("获取本地cookie失败！" + err);
                } else {
                    // let str = JSON.parse(data).reduce((s, item) => {
                    //     s += `${item.name}=${item.value};`;
                    //     return s;
                    // }, '');
                    // resolve(str);
                    resolve(data);
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
                "Cookie": await this.getCookies(),
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