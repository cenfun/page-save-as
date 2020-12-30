const path = require("path");
const Util = require("./util.js");

const screenshotModule = async (option) => {

    const url = option.url;

    console.log(`generate pdf: ${url}`);

    const ext = `.${option.type}`;
    let name = option.name;
    const extname = path.extname(name);
    if (extname !== ext) {
        name += ext;
    }
    let imagePath = path.resolve(option.output, name);
    imagePath = Util.formatPath(imagePath);

    const browserOption = {};
    browserOption.headless = !option.edit;

    const browser = await Util.launchBrowser(browserOption);
    if (!browser) {
        return;
    }

    const page = await browser.newPage();
    await page.goto(url, {
        timeout: 60 * 1000,
        waitUntil: "networkidle0"
    });

    await Util.delay(1000);
    await Util.scroll(page);
    await Util.edit(page);

    const screenshotOption = {
        path: imagePath,
        fullPage: true
    };

    if (option.type === "jpg" || option.type === "jpeg") {
        screenshotOption.type = "jpeg";
        screenshotOption.quality = option.quality || 100;
    }

    console.log(screenshotOption);

    await page.screenshot(screenshotOption);

    await page.close();
    await browser.close();
    Util.finishBrowserUserDataDir(browser.userDataDir);
    Util.cleanUserDataDir();

    option.imagePath = imagePath;
    return imagePath;
};

module.exports = screenshotModule;