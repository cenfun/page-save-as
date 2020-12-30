const Util = require("./util.js");

const pdfModule = async (option) => {

    const browser = option.browser;
    const page = option.page;

    const pdfOption = Object.assign({
        path: option.savePath,
        format: "A4",
        // headerTemplate: "<p>Header</p>",
        // footerTemplate: "<p>Footer</p>",
        // displayHeaderFooter: true,
        margin: {
            left: "10px",
            right: "10px",
            top: "20px",
            bottom: "20px"
        },
        printBackground: true
    }, option.pdfOption);

    await page.pdf(pdfOption);
    await page.close();
    await browser.close();
    Util.finishBrowserUserDataDir(browser.userDataDir);
    Util.cleanUserDataDir();

    return 0;
};

module.exports = pdfModule;