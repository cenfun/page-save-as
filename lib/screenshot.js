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

    const browserOption = {
    };
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

    let pngPath = path.resolve(option.output, name);
    pngPath = Util.formatPath(pngPath);

    const screenshotOption = {
        path: pngPath,
        fullPage: true
    };

    if (option.type === "jpg" || option.type === "jpeg") {
        screenshotOption.type = "jpeg";
        screenshotOption.quality = option.quality || 100;
    }
    

    await page.screenshot(screenshotOption);

    await page.close();
    await browser.close();
    Util.finishBrowserUserDataDir(browser.userDataDir);
    Util.cleanUserDataDir();

    option.pngPath = pngPath;
    return pngPath;
};

module.exports = screenshotModule;