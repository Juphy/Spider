let {
    Album,
    Image,
    Image1,
    Img
} = require("../lib/model");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
(async()=>{
    let i = 45615;
    while(i < 129544){
        await Album.findOne({
            where: {
                id: i,
                category: 'win'
            }
        }).then(async album =>{
            console.log(i)
            if(album){
                let tag = album.tags.toString();
                if(!tag.length||
                    tag.includes('欧美')||
                    tag.includes('时装秀')||
                    tag.includes('明星') ||
                    tag.includes('小鲜肉') ||
                    tag.includes('电视剧') ||
                    tag.includes('剧照') ||
                    tag.includes('海报') ||
                    tag.includes("小生") ||
                    tag.includes("帅哥") ||
                    tag.includes('男')||
                    tag.includes('吐槽')||
                    tag.includes('创意')||
                    tag.includes("动图")||
                    tag.includes("GIF")|| 
                    tag.includes("有趣")||
                    tag.includes('电影')||
                    tag.includes('文字')
                ){
                    await Img.destroy({
                        where: {
                            album_id: album.id
                        }
                    });
                    console.log(album.name);
                    await album.destroy();
                }
            }
        })
        i++;
    }
})()
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
// (async() => {
//     let i = 0;
//     while (i < 68380) {
//         let img = await Image1.findOne({
//             where: {
//                 id: i
//             }
//         });
//         if (img) {
//             let _img = await Image.findOne({
//                 where: {
//                     name: img.name
//                 }
//             });
//             if (!_img) {
//                 await Image.create({
//                     name: img.name,
//                     album_id: img.album_id,
//                     width: img.width,
//                     height: img.height,
//                     album_name: img.album_name,
//                     sina_url: img.sina_url,
//                     url: img.url
//                 })
//             }
//             await img.destroy();
//         }
//         i++;
//     }
// })()