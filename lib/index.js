const fs = require("fs");
const path = require("path");
const assert = require("assert");
const Util = require("./util.js");
const pdfModule = require("./pdf.js");
const screenshotModule = require("./screenshot.js");

const defaultOption = {
    url: "",
    name: "",
    type: "jpg",
    width: 1600,
    edit: false,
    scroll: false,
    output: "./output",
    
    quality: 100,
    pdfOption: {}
};

const initSavePath = async (option) => {
    const ext = `.${option.type}`;
    let filename = option.name;
    if (!filename) {
        filename = await option.page.evaluate(function() {
            return document.title || "page-name";
        });
        //console.log(filename);
    }
    filename = Util.getFileName(filename);
    const extname = path.extname(filename);
    if (extname !== ext) {
        filename += ext;
    }
    const savePath = path.resolve(option.output, filename);
    option.savePath = savePath;
};

module.exports = async (option) => {

    option = Object.assign(defaultOption, option);

    Util.option = option;

    assert.ok(option.url, "Require url");

    //init output
    option.output = path.resolve(option.output);
    if (!fs.existsSync(option.output)) {
        fs.mkdirSync(option.output, {
            recursive: true
        });
    }

    option.type = Util.getOutputType(option.type);

    const url = option.url;
    console.log(`generate ${option.type}: ${url}`);

    //======================================================================
    const browserOption = {};
    browserOption.headless = !option.edit;

    const browser = await Util.launchBrowser(browserOption);
    if (!browser) {
        return 1;
    }
    option.browser = browser;

    const page = await browser.newPage();
    option.page = page;
    //======================================================================

    await page.goto(url, {
        timeout: 60 * 1000,
        waitUntil: "networkidle0"
    });

    //======================================================================

    await initSavePath(option);

    //======================================================================

    await Util.delay(1000);
    await Util.scroll(page);
    await Util.edit(page);

    if (option.type === "pdf") {
        return pdfModule(option);
    }

    return screenshotModule(option);

};