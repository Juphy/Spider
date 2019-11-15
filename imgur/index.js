const request = require('request'),
    querystring = require('querystring');

class Imgur {
    constructor(config) {
        this.client_id = config.client_id;
        this.client_secret = config.client_secret;
        this.access_token = config.access_token;
        this.api = config.api;
        this.image = config.image;
        this.headers = {
            // Authorization: 'Client-ID ' + this.client_id
            Authorization: 'Bearer ' + this.access_token
        }
    }

    //     async get_image(hash){
    //         let headers = {
    //             Authorization: 'Client-ID '+this.client_id
    //         };
    //         let options = {
    //             method: 'GET',
    //             hostname: this.api,
    //             path: this.image+'/'+hash,
    //             headers
    //         };
    //         return new Promise((resolve, reject)=>{
    //             var req = https.request(options, res =>{
    //                 var chunks = [];
    //                 res.on('data', chunk =>{
    //                     chunks.push(chunk);
    //                 })
    //                 res.on('end', () =>{
    //                     var body = Buffer.concat(chunks);
    //                     resolve(JSON.parse(body.toString()));
    //                 })
    //                 res.on("error", error =>{
    //                     reject(error);
    //                 })
    //             });
    //             var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; ------WebKitFormBoundary7MA4YWxkTrZu0gW--";
    //             req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
    //             req.write(postData);
    //             req.end();
    //         }) 
    //     }
    // }


    get_response(options) {
        return new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                body = JSON.parse(body);
                console.log(response.headers);
                if (!error && response.statusCode == 200) {
                    resolve(body)
                } else {
                    reject(body);
                }
            })
        })
    }

    async get_credits() {
        let options = {
            method: 'GET',
            url: `https://${this.api}/3/credits`,
            headers: this.headers
        };
        return this.get_response(options);
    }

    async get_image(hash) {
        let options = {
            method: 'GET',
            url: 'https://' + this.api + this.image + '/' + hash,
            headers: this.headers
        };
        return this.get_response(options);
    }

    /**
     * 
     * @param {string} image- binary file, base64 data, a URL for an image
     * @param {*} type 
     * @param {*} title 
     * @param {*} album 
     * @param {*} name 
     */
    async upload_image(image = '', type = '', title = '', album = '', name = '') {
        let formData = {};
        if (image) formData['image'] = imgae;
        if (type) formData['type'] = type;
        if (title) formData['image'] = title;
        if (album) formData['album'] = album;
        if (name) formData['name'] = name;
        let options = {
            method: 'POST',
            url: `https://${this.api}${this.image}`,
            headers: this.headers,
            formData
        };
        return this.get_response(options);
    }

    async delete_image(hash) {
        let option = {

        }
    }
}

module.exports = Imgur;