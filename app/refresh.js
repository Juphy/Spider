let {
    Album
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
