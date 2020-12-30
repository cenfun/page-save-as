const fs = require("fs");
const path = require("path");
const assert = require("assert");
const Util = require("./util.js");
const pdfModule = require("./pdf.js");
const screenshotModule = require("./screenshot.js");

const defaultOption = {
    output: "./output",
    name: "name",
    width: 1600,
    edit: false,
    scroll: false
};

module.exports = (option) => {

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
    console.log(option.type);

    if (option.type === "pdf") {
        return pdfModule(option);
    }

    return screenshotModule(option);

};