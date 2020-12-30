const Util = require("./util.js");

const screenshotModule = async (option) => {

    const browser = option.browser;
    const page = option.page;

    const screenshotOption = {
        path: option.savePath,
        fullPage: true
    };

    if (option.type === "jpg" || option.type === "jpeg") {
        screenshotOption.type = "jpeg";
        screenshotOption.quality = option.quality || 100;
    }
    //console.log(screenshotOption);

    await page.screenshot(screenshotOption);

    await page.close();
    await browser.close();
    Util.finishBrowserUserDataDir(browser.userDataDir);
    Util.cleanUserDataDir();

    return 0;
};

module.exports = screenshotModule;