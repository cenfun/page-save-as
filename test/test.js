const PSA = require('../lib');

const url = 'https://mp.weixin.qq.com/s?__biz=Mzk0NjMwMDc1Nw==&mid=2247705994&idx=2&sn=bc505beb68d05253e9c34a9b23379cee&source=41';

//const url = "http://www.chinaz.com/";

PSA({
    url: url,
    //name: "zg-winter-girl",
    type: 'png',
    edit: true,
    scroll: true,
    width: 1200,
    output: './output',
    delay: 1,
    timeout: 120
});
