const request = require('request');

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
                body = body ? JSON.parse(body) : error;
                // console.log(response.headers);
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

    async get_image(imageHash) {
        let options = {
            method: 'GET',
            url: 'https://' + this.api + this.image + '/' + imageHash,
            headers: this.headers
        };
        return this.get_response(options);
    }

    /**
     * 
     * @param {string} image - required. binary file, base64 data, a URL for an image
     * @param {string} type - required. the type of the file that's being sent; file, base64 or URL 
     * @param {string} title - this title of the image 
     * @param {string} album - the id of the album you want to add the image to.{{albumHash}}
     * @param {string} name - the name of the file, this is automatically detected if uploading a file width a POST and multipar/form-data
     * @param {string} description - The description of the image
     */
    async upload_image(image = '', type = '', title = '', album = '', name = '', description = '') {
        let formData = {};
        if (image) formData['image'] = imgae;
        if (type) formData['type'] = type;
        if (title) formData['image'] = title;
        if (album) formData['album'] = album;
        if (name) formData['name'] = name;
        if (description) formData['description'] = description;
        let options = {
            method: 'POST',
            url: `https://${this.api}${this.image}`,
            headers: this.headers,
            formData
        };
        return this.get_response(options);
    }

    async delete_image_unauthed(imageDeleteHash) {
        let options = {
            method: 'GET',
            url: 'https://' + this.api + this.image + '/' + imageDeleteHash,
            headers: {
                Authorization: 'Client-ID ' + this.client_id
            }
        };
        return this.get_response(options);
    }

    async delete_image_authed(imageHash) {
        let options = {
            method: 'GET',
            url: 'https://' + this.api + this.image + '/' + imageHash,
            headers: {
                Authorization: 'Bearer ' + this.access_token
            }
        };
        return this.get_response(options);
    }

    async update_image_noauthed(imageDeleteHash, title, description) {
        let options = {
            method: 'POST',
            url: `https://${this.api}${this.image}/${imageDeleteHash}`,
            headers: {
                Authorization: 'Client-ID ' + this.client_id
            },
            formData: {
                title,
                description
            }
        };
        return this.get_response(options);
    }

    async update_image_noauthed(imageHash, title, description) {
        let options = {
            method: 'POST',
            url: `https://${this.api}${this.image}/${imageHash}`,
            headers: {
                Authorization: 'Bearer ' + this.access_token
            },
            formData: {
                title,
                description
            }
        };
        return this.get_response(options);
    }

    async favorite_image(imageHash) {
        let options = {
            method: 'POST',
            url: `https://${this.api}${this.image}/${imageHash}/favorite`,
            headers: {
                Authorization: 'Bearer ' + this.access_token
            }
        };
        return this.get_response(options);
    }

    async generate_access_token() {
        let options = {
            method: 'POST',
            url: `https://${this.api}oauth2/token`,
            formData: {
                refresh_token: '',
                client_id: this.client_id,
                client_secret: this.client_secret,
                grant_type: 'refresh_token'
            }
        };
        return this.get_response(options);
    }

    async account_base(username) {
        let options = {
            method: 'GET',
            url: `https://${this.api}3/account/${username}`,
            headers: {
                Authorization: 'Client-ID ' + this.client_id
            }
        };
        return this.get_response(options);
    }

    async account_block_status(username) {
        let options = {
            method: 'GET',
            url: `https://${this.api}account/v1/${username}/block`,
            headers: {
                Authorization: 'Bearer ' + this.access_token,
                Accept: 'application/vnd.api+json'
            }
        };
        return this.get_response(options);
    }

    async account_blocks() {
        let options = {
            method: 'GET',
            url: `https://${this.api}3/account/me/block`,
            headers: {
                Authorization: 'Bearer ' + this.access_token,
                Accept: 'application/vnd.api+json'
            }
        };
        return this.get_response(options);
    }

    async account_images() {
        let options = {
            method: 'GET',
            url: `https://${this.api}3/account/me/images`,
            headers: {
                Authorization: 'Bearer ' + this.access_token
            }
        };
        return this.get_response(options);
    }
}
module.exports = Imgur;