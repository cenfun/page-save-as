#!/usr/bin/env node

const PSA = require("./index.js");

//===============================================================
//https://github.com/tj/commander.js
const program = require("commander");

//===============================================================

program
    .arguments("<url> <name>")
    .option("-t, --type <type>", "save type: jpg(default)/png/pdf")
    .option("-w, --width <width>", "page width")
    .option("-e, --edit", "edit mode")
    .action(function(url, name, args) {
        const option = Object.assign({}, args, {
            url: url,
            name: name
        });
        //console.log(option);
        PSA(option);
    });

program
    .command("*")
    .action(function() {
        console.log(" unknown command, try psa --help");
    });

//===============================================================
program.parse(process.argv);

//last one if no args
if (program.rawArgs.length < 3) {
    program.help();
}
