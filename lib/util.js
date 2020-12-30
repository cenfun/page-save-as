const fs = require("fs");
const path = require("path");
// const os = require("os");
// const net = require("net");
const rimraf = require("rimraf");
const PCR = require("puppeteer-chromium-resolver");

const Util = {

    root: process.cwd(),

    getOutputType: function(t) {
        const types = {
            jpg: "jpg",
            jpeg: "jpeg",
            png: "png",
            pdf: "pdf"
        };
        const type = types[t] || types.jpg;
        return type;
    },

    launchBrowser: async (browserOption) => {
       
        //tab height 80, 980-80=900
        //scrollbar width 20, 1280-20=1260
        //https://peter.sh/experiments/chromium-command-line-switches/
        const defaultViewport = Util.getDefaultViewport({
            width: Util.option.width
        });
        browserOption = Object.assign({
            userDataDir: Util.getBrowserUserDataDir(),
            args: Util.getBrowserLaunchArgs(),
            ignoreDefaultArgs: Util.getBrowserLaunchIgnoreArgs(),
            defaultViewport: defaultViewport
        }, browserOption);

        if (!Util.puppeteer) {
            const stats = PCR.getStats();
            if (!stats) {
                return;
            }
            Util.puppeteer = stats.puppeteer;
            Util.executablePath = stats.executablePath;
        }
    
        browserOption.executablePath = Util.executablePath;
        const browser = await Util.puppeteer.launch(browserOption);
        const chromiumVersion = await browser.version();
        console.log(`[browser] launch success version: ${chromiumVersion}`);
    
        browser.userDataDir = browserOption.userDataDir;
    
        return browser;
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
        fs.writeFileSync(finished, "");
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
                Util.rmSync(dir);
                return;
            }

            const finished = path.normalize(`${dir}/finished`);
            if (fs.existsSync(finished)) {
                //finished out time 10s
                const info = fs.statSync(finished);
                const duration = Date.now() - new Date(info.mtime).getTime();
                if (duration > 10 * 1000) {
                    Util.rmSync(dir);
                    return;
                }
            }

            //folder out time 2h
            const info = fs.statSync(dir);
            const duration = Date.now() - new Date(info.mtime).getTime();
            if (duration > 2 * 60 * 60 * 1000) {
                Util.rmSync(dir);
            }
        });

    },

    //https://github.com/GoogleChrome/puppeteer/blob/master/lib/Launcher.js#L38
    getBrowserLaunchArgs: function(list = []) {
        return [
            "--no-sandbox",
            "--no-default-browser-check",
            "--disable-setuid-sandbox",
            "--disable-translate",
            "--disable-gpu",
            "--disable-infobars",
            "--disable-notifications",
            "--disable-save-password-bubble"
            //"--start-maximized"
        ].concat(list);
    },

    //https://github.com/GoogleChrome/puppeteer/blob/master/lib/Launcher.js#L246
    getBrowserLaunchIgnoreArgs: function(list = []) {
        return [
            "--hide-scrollbars",
            "--enable-automation"
        ].concat(list);
    },

    getDefaultViewport: function(defaultViewport = {}) {
        return Object.assign({
            width: 1920,
            height: 1080
        }, defaultViewport);
    },

    getTempRoot: function() {
        if (Util.tempRoot) {
            return Util.tempRoot;
        }
        const tempPath = ".temp";
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

    // \ to /
    formatPath: function(str) {
        if (str) {
            str = str.replace(/\\/g, "/");
        }
        return str;
    },

    relativePath: function(p, root) {
        let rp = path.relative(root || Util.root, p);
        rp = Util.formatPath(rp);
        return rp;
    },

    readdir(p) {
        return new Promise((resolve) => {
            fs.readdir(p, (err, list) => {
                if (err) {
                    resolve([]);
                    return;
                }
                resolve(list);
            });
        });
    },

    stat(p) {
        return new Promise((resolve) => {
            fs.lstat(p, (err, stats) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(stats);
            });
        });
    },

    rm(f, option = {}) {
        return new Promise((resolve) => {
            rimraf(f, option, function(err) {
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
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
    token: function(len, pre = "", post = "") {
        let str = Math.random().toString().substr(2);
        if (len) {
            str = str.substr(0, Util.toNum(len));
        }
        return pre + str + post;
    },

    replace: function(str, obj, defaultValue) {
        str = `${str}`;
        if (!obj) {
            return str;
        }
        str = str.replace(/\{([^}{]+)\}/g, function(match, key) {
            if (!obj.hasOwnProperty(key)) {
                if (typeof(defaultValue) !== "undefined") {
                    return defaultValue;
                }
                return match;
            }
            let val = obj[key];
            if (typeof(val) === "function") {
                val = val(obj, key);
            }
            if (typeof(val) === "undefined") {
                val = "";
            }
            return val;
        });
        return str;
    },

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, "0");
    },

    //============================================================================
    //number
    isNum: function(num) {
        if (typeof(num) !== "number" || isNaN(num)) {
            return false;
        }
        const isInvalid = function(n) {
            if (n === Number.MAX_VALUE || n === Number.MIN_VALUE || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
                return true;
            }
            return false;
        };
        if (isInvalid(num)) {
            return false;
        }
        return true;
    },

    // format to a valid number
    toNum: function(num, toInt) {
        if (typeof(num) !== "number") {
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

    clamp: function(num, min, max) {
        return Math.max(Math.min(num, max), min);
    },

    //============================================================================
    //date
    isDate: function(date) {
        if (!date || !(date instanceof Date)) {
            return false;
        }
        //is Date Object but Date {Invalid Date}
        if (isNaN(date.getTime())) {
            return false;
        }
        return true;
    },

    toDate: function(input) {
        if (Util.isDate(input)) {
            return input;
        }
        //fix time zone issue by use "/" replace "-"
        const inputHandler = function(input) {
            if (typeof(input) !== "string") {
                return input;
            }
            //do NOT change ISO format: 2020-03-20T19:10:38.358Z
            if (input.indexOf("T") !== -1) {
                return input;
            }
            input = input.split("-").join("/");
            return input;
        };
        input = inputHandler(input);
        let date = new Date(input);
        if (Util.isDate(date)) {
            return date;
        }
        date = new Date();
        return date;
    },

    //============================================================================
    //array
    isList: function(data) {
        if (data && data instanceof Array && data.length > 0) {
            return true;
        }
        return false;
    },

    inList: function(item, list) {
        if (!Util.isList(list)) {
            return false;
        }
        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i] === item) {
                return true;
            }
        }
        return false;
    },

    toList: function(data, separator) {
        if (data instanceof Array) {
            return data;
        }
        if (typeof(data) === "string" && (typeof(separator) === "string" || separator instanceof RegExp)) {
            return data.split(separator);
        }
        if (typeof(data) === "undefined" || data === null) {
            return [];
        }
        return [data];
    },

    //============================================================================
    //object
    getValue: function(data, dotPathStr, defaultValue) {
        if (!dotPathStr) {
            return defaultValue;
        }
        let current = data;
        const list = dotPathStr.split(".");
        const lastKey = list.pop();
        while (current && list.length) {
            const item = list.shift();
            current = current[item];
        }
        if (current && current.hasOwnProperty(lastKey)) {
            const value = current[lastKey];
            if (typeof(value) !== "undefined") {
                return value;
            }
        }
        return defaultValue;
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
    }

};

module.exports = Util;