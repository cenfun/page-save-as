#!/usr/bin/env node

const PSA = require("./index.js");

//===============================================================
//https://github.com/tj/commander.js
const program = require("commander");

//===============================================================

program
    .arguments("<url>")
    .option("-n, --name <name>", "save filename")
    .option("-t, --type <type>", "file type: jpg(default)/png/pdf")
    .option("-w, --width <width>", "page width")
    .option("-s, --scroll", "scroll to bottom")
    .option("-e, --edit", "edit mode")
    .option("-o, --output <path>", "output path")
    .option("-ds, --delay <s>", "delay in seconds")
    .option("-ts, --timeout <s>", "timeout in seconds")
    .action(function(url, args) {
        const option = Object.assign({}, args, {
            url: url
        });
        //console.log(option);
        PSA(option).then(function(option) {
            process.exit(option.code);
        });
    });

program
    .command("*")
    .action(function() {
        console.log("unknown command, try psa --help");
    });

//===============================================================
program.parse(process.argv);

//last one if no args
if (program.rawArgs.length < 3) {
    program.help();
}
