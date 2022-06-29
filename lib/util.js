const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const PCR = require('puppeteer-chromium-resolver');

const Util = {

    root: process.cwd(),

    getOutputType: function(t) {
        const types = {
            jpg: 'jpg',
            jpeg: 'jpeg',
            png: 'png',
            pdf: 'pdf'
        };
        const type = types[t] || types.jpg;
        return type;
    },

    launchBrowser: async (browserOption) => {

        //tab height 80, 980-80=900
        //scrollbar width 20, 1280-20=1260
        //https://peter.sh/experiments/chromium-command-line-switches/

        browserOption = {
            userDataDir: Util.getBrowserUserDataDir(),
            args: Util.getBrowserLaunchArgs(),
            ignoreDefaultArgs: Util.getBrowserLaunchIgnoreArgs(),
            ... browserOption
        };

        if (!Util.puppeteer) {
            const stats = await Util.getPCRStats();
            if (!stats) {
                return;
            }
            Util.puppeteer = stats.puppeteer;
            Util.executablePath = stats.executablePath;
        }

        browserOption.executablePath = Util.executablePath;

        let failed = false;
        const browser = await Util.puppeteer.launch(browserOption).catch(function(err) {
            console.log(err);
            failed = true;
        });

        if (failed) {
            return;
        }

        browser.userDataDir = browserOption.userDataDir;

        return browser;
    },

    closeBrowser: async (browser) => {
        if (!browser) {
            return;
        }
        await browser.close();
        Util.finishBrowserUserDataDir(browser.userDataDir);
        Util.cleanUserDataDir();
    },

    getPCRStats: () => {
        const stats = PCR.getStats();
        if (fs.existsSync(stats.executablePath)) {
            return stats;
        }
        return PCR();
    },

    finishBrowserUserDataDir: function(dir) {
        if (!dir) {
            return;
        }
        if (!fs.existsSync(dir)) {
            return;
        }
        const finished = path.normalize(`${dir}/finished`);
        //console.log(`save finished: ${finished}`);
        fs.writeFileSync(finished, '');
    },

    //run each browser launched
    cleanUserDataDir: function(force = false) {
        const udd = Util.getUserDataDir();
        if (!fs.existsSync(udd)) {
            return;
        }

        const dirs = fs.readdirSync(udd);
        const total = dirs.length;
        if (!total) {
            return;
        }
        dirs.forEach(function(folderName, i) {
            const dir = path.resolve(udd, folderName);
            if (!fs.existsSync(dir)) {
                return;
            }
            if (force) {
                console.log(`remove browser cache: ${dir}`);
                Util.rmSync(dir);
                return;
            }

            const finished = path.normalize(`${dir}/finished`);
            if (fs.existsSync(finished)) {
                //finished out time 10s
                const info = fs.statSync(finished);
                const duration = Date.now() - new Date(info.mtime).getTime();
                if (duration > 10 * 1000) {
                    console.log(`remove browser cache: ${dir}`);
                    Util.rmSync(dir);
                    return;
                }
            }

            //folder out time 2h
            const info = fs.statSync(dir);
            const duration = Date.now() - new Date(info.mtime).getTime();
            if (duration > 2 * 60 * 60 * 1000) {
                console.log(`remove browser cache: ${dir}`);
                Util.rmSync(dir);
            }
        });

    },

    //https://github.com/GoogleChrome/puppeteer/blob/master/lib/Launcher.js#L38
    getBrowserLaunchArgs: function(list = []) {
        return [
            '--no-sandbox',
            '--no-default-browser-check',
            '--disable-setuid-sandbox',
            '--disable-translate',
            '--disable-gpu',
            '--disable-infobars',
            '--disable-notifications',
            '--disable-save-password-bubble'
            //"--start-maximized"
        ].concat(list);
    },

    //https://github.com/GoogleChrome/puppeteer/blob/master/lib/Launcher.js#L246
    getBrowserLaunchIgnoreArgs: function(list = []) {
        return [
            '--hide-scrollbars',
            '--enable-automation'
        ].concat(list);
    },

    getDefaultViewport: function(defaultViewport = {}) {
        return {
            width: 1920,
            height: 1080,
            ... defaultViewport
        };
    },

    getTempRoot: function() {
        if (Util.tempRoot) {
            return Util.tempRoot;
        }
        const tempPath = '.temp';
        Util.tempRoot = Util.formatPath(path.resolve(Util.root, tempPath));
        if (!fs.existsSync(Util.tempRoot)) {
            fs.mkdirSync(Util.tempRoot, {
                recursive: true
            });
        }
        return Util.tempRoot;
    },

    getUserDataDir: function() {
        return `${Util.getTempRoot()}/user-data-dir`;
    },

    getBrowserUserDataDir: function() {
        return `${Util.getUserDataDir()}/chromium-${Util.token(8)}`;
    },

    //====================================================================================================

    getFileName: function(title, maxLen = 60) {
        title = String(title);
        title = title.replace(/[\\/":|*?<>]/g, '');
        title = title.trim();
        title = title.replace(/\s+/g, '-');
        if (title.length > maxLen) {
            title = title.substr(0, maxLen);
        }
        return title;
    },

    // \ to /
    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, '/');
        }
        return str;
    },

    rmSync(f, option = {}) {
        let res;
        try {
            res = rimraf.sync(f, option);
        } catch (e) {
            console.log(e);
        }
        return res;
    },

    //============================================================================
    //string
    token: function(len, pre = '', post = '') {
        let str = Math.random().toString().substr(2);
        if (len) {
            str = str.substr(0, Util.toNum(len));
        }
        return pre + str + post;
    },

    // format to a valid number
    toNum: function(num, toInt) {
        if (typeof (num) !== 'number') {
            num = parseFloat(num);
        }
        if (isNaN(num)) {
            num = 0;
        }
        if (toInt) {
            num = Math.round(num);
        }
        return num;
    },

    //============================================================================
    //async
    delay: function(ms) {
        return new Promise((resolve) => {
            if (ms) {
                setTimeout(resolve, ms);
            } else {
                setImmediate(resolve);
            }
        });
    },

    tasksResolver: async function(list, option = {}) {

        const itemHandler = async (item) => {

            const exitCode = await item.call(this, option);

            if (typeof exitCode === 'function') {
                return itemHandler(option);
            }

            return exitCode;
        };

        for (const item of list) {
            const exitCode = await itemHandler(item);
            //return if has error and not ignore error
            if (exitCode !== 0 && !option.ignoreError) {
                return exitCode;
            }
        }

        return 0;
    }

};

module.exports = Util;
