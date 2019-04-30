let {
    Album,
    Image,
    Image1
} = require("../lib/model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// (async () =>{
//     let i=1;
//     while(i<=1561){
//         await Album.findOne({
//             where: {
//                 id: i
//             }
//         }).then(album =>{
//            if(album){
//                album.update({
//                    album_url: 'https://www.nvshens.com'+album.album_url
//                })
//            }
//            i++;
//         });
//     }
// })()

// (async () => {
//     let i = 2165;
//     while (i <= 2996) {
//         let album = await Album.findOne({
//             where: {
//                 id: i,
//                 category: 'nvshens'
//             }
//         });
//         if (album && !album.album_url.includes('http')) {
//             await album.update({
//                 album_url: 'https://www.nvshens.com' + album.album_url
//             })
//         }
//         i++;
//     }
// })()
(async() => {
    let i = 0;
    while (i < 68380) {
        let img = await Image1.findOne({
            where: {
                id: i
            }
        });
        if (img) {
            let _img = await Image.findOne({
                where: {
                    name: img.name
                }
            });
            if (!_img) {
                await Image.create({
                    name: img.name,
                    album_id: img.album_id,
                    width: img.width,
                    height: img.height,
                    album_name: img.album_name,
                    sina_url: img.sina_url,
                    url: img.url
                })
            }
            await img.destroy();
        }
        i++;
    }
})()