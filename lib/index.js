const fs = require("fs");
const path = require("path");
const assert = require("assert");
const inquirer = require("inquirer");
const EC = require("eight-colors");
const Util = require("./util.js");
const defaultOption = require("./option.js");

const mergeOption = (args) => {
    const option = Object.assign({}, defaultOption);
    for (const k in args) {
        if (typeof option[k] === "object") {
            Object.assign(option[k], args[k]);
        } else {
            option[k] = args[k];
        }
    }

    return option;
};

const backToTop = async (option) => {
    await option.page.evaluate(function() {
        window.scrollTo(0, 0);
    }).catch(function(err) {
        console.log(EC.red(err));
    });
    await Util.delay(1000);
    console.log("page scrolled back to top");
    return 0;
};

const initSavePath = async (option) => {
    const ext = `.${option.type}`;
    let filename = option.name;
    if (!filename) {
        const title = await option.page.evaluate(function() {
            return document.title;
        });
        filename = `${title}`;
    }
    filename = Util.getFileName(filename);
    const extname = path.extname(filename);
    if (extname !== ext) {
        filename += ext;
    }

    console.log(`filename is: ${filename}`);

    const savePath = path.resolve(option.output, filename);
    option.savePath = savePath;
};

const launchBrowser = async (option) => {
    console.log("launching browser ...");
    const browser = await Util.launchBrowser({
        headless: option.headless,
        defaultViewport: option.viewport
    });
    if (!browser) {
        return 1;
    }
    const chromiumVersion = await browser.version();
    console.log(EC.green(`browser launched: ${chromiumVersion}`));
    option.browser = browser;
    return 0;
};

const loadPage = async (option) => {
    const page = await option.browser.newPage();

    const url = option.url;
    const timeout = option.timeout * 1000;
    console.log(`loading page (timeout: ${timeout}ms) ${url} ...`);

    let code = 0;
    await page.goto(url, {
        timeout: timeout
    }).catch(function(err) {
        console.log(EC.red(err));
        code = 1;
    });

    if (code) {
        return code;
    }

    const delay = option.delay * 1000;
    console.log(`page loaded and delay ${delay}ms ...`);
    await Util.delay(delay);

    option.page = page;

    return 0;
};

const startScroll = async (option) => {

    if (!option.scroll) {
        return 0;
    }

    const page = option.page;

    const posStart = await page.evaluate(function() {
        return window.scrollY;
    });

    const viewport = option.viewport;

    const hw = viewport.width * 0.5;
    const hh = viewport.height * 0.5;
    await page.mouse.move(hw, hh);

    const deltaY = Math.round(viewport.height * 0.9);

    await page.mouse.wheel({
        deltaY: deltaY
    });
    await Util.delay(1000);
    
    const posEnd = await page.evaluate(function() {
        return window.scrollY;
    });

    console.log(`page scrolled: ${posStart} -> ${posEnd}`);

    //check end
    if (posEnd === posStart) {
        return backToTop(option);
    }

    return startScroll(option);
};

const startEdit = async (option) => {

    //not for headless
    if (option.headless) {
        return 0;
    }

    console.log("starting edit mode ...");
    const promptList = [{
        name: "ok",
        type: "string",
        message: "Please enter to continue when you are finished editing"
    }];
    await inquirer.prompt(promptList);

    return 0;
};

const savePageAsPdf = async (page, savePath, pdfOption = {}) => {
    console.log("saving page as pdf ...");
    pdfOption.path = savePath;
    let code = 0;
    await page.pdf(pdfOption).catch(function(err) {
        console.log(EC.red(err));
        code = 1;
    });
    return code;
};

const saveAsPdf = async (option) => {
    if (option.headless) {
        return savePageAsPdf(option.page, option.savePath, option.pdfOption);
    }
    //without headless
    console.log(EC.yellow("NOTE: Generating a pdf is currently only supported in Chrome headless"));

    const config = {
        headless: true,
        viewport: option.viewport
    };
    let code = await launchBrowser(config);
    if (code) {
        return code;
    }

    //remove script first
    console.log("removing all scripts ...");
    await option.page.evaluate(function() {
        const scripts = document.querySelectorAll("script");
        for (const item of scripts) {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }
    });

    console.log("getting html content ...");
    const content = await option.page.content();

    const page = await config.browser.newPage();
    console.log("setting page content ...");
    await page.setContent(content);
    
    await Util.delay(500);

    code = await savePageAsPdf(page, option.savePath, option.pdfOption);

    await page.close();
    await Util.closeBrowser(config.browser);

    return code;
};

const saveAsImage = async (option) => {
    console.log("saving page as image ...");
    const imageOption = {
        path: option.savePath
    };
    Object.assign(imageOption, option.imageOption);
    if (option.type === "jpg" || option.type === "jpeg") {
        imageOption.type = "jpeg";
    } else {
        delete imageOption.quality;
    }
    let code = 0;
    await option.page.screenshot(imageOption).catch(function(err) {
        console.log(EC.red(err));
        code = 1;
    });
    return code;
};

const saveAs = async (option) => {
    console.log(`saving page as ${option.type} ...`);

    await initSavePath(option);

    if (option.type === "pdf") {
        return saveAsPdf(option);
    }
    return saveAsImage(option);
};

module.exports = async (args) => {

    const option = mergeOption(args);
    //for global
    Util.option = option;

    assert.ok(option.url, "Require url");

    //======================================================================
    //init output
    option.output = path.resolve(`${option.output}`);
    if (!fs.existsSync(option.output)) {
        fs.mkdirSync(option.output, {
            recursive: true
        });
    }

    option.type = Util.getOutputType(option.type);

    //======================================================================
    option.headless = !option.edit;

    const viewport = {};
    if (option.width) {
        viewport.width = Util.toNum(option.width);
    }

    option.viewport = Util.getDefaultViewport(viewport);

    const tasks = [(option) => {
        return launchBrowser(option);
    }, (option) => {
        return loadPage(option);
    }, (option) => {
        return startScroll(option);
    }, (option) => {
        return startEdit(option);
    }, (option) => {
        return saveAs(option);
    }];

    option.code = await Util.tasksResolver(tasks, option);

    if (option.page) {
        await option.page.close();
    }
    if (option.browser) {
        await Util.closeBrowser(option.browser);
    }

    if (!option.code) {
        console.log(EC.green(`generated file: ${option.savePath}`));
    }

    return option;
};