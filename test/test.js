const PSA = require("../lib");

const url = "https://mp.weixin.qq.com/s/qBTUgtRDP9k7-FR50UBmBw";

PSA({
    url: url,
    //name: "zg-winter-girl",
    type: "png",
    edit: true,
    scroll: true,
    width: 1200
});