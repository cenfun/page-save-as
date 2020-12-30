const path = require("path");
const Util = require("./util.js");

const pdfModule = async (option) => {

    const url = option.url;

    console.log(`generate pdf: ${url}`);

    let name = option.name;
    const extname = path.extname(name);
    if (extname !== ".pdf") {
        name += ".pdf";
    }

    let pdfPath = path.resolve(option.output, name);
    pdfPath = Util.formatPath(pdfPath);

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

    await Util.delay(1000);
    
    //scroll to bottom
    //await page.evaluate(async () => {
        
    //});

    //await Util.delay(1000);

    const pdfOption = Object.assign({
        path: pdfPath,
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

    option.pdfPath = pdfPath;
    return pdfPath;
};

module.exports = pdfModule;