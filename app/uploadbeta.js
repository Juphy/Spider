let cheerio = require('cheerio'),
    schedule = require('node-schedule'),
    request = require("request-promise"),
    { URL_UPLOADBETA: UPLOADBETA, SINAURL: SINA } = require('../config');

let weibo = require("../main");

const {
    Photo
} = require("../lib/model");

let keys = ['%E6%8E%A8%E5%A5%B3%E9%83%8E', '%E6%80%A7%E6%84%9F', '%E8%BD%A6%E6%A8%A1','%E7%BE%8E%E8%85%BF'];

let i =0;
let page = 0, pagesize=20;

const main = async () =>{
    while(i < keys.length){
        let images = await request({
            url: `https://uploadbeta.com/api/pictures/search/?key=${keys[i]}&start=${page}&offset=${pagesize}`
        });
        i++;
    }
}
