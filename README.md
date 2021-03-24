# Page Save As
> Page save as JPG/PNG/PDF

It uses Puppeteer([
puppeteer-chromium-resolver](https://github.com/cenfun/puppeteer-chromium-resolver)) API to save a page.


## Install
```
npm i page-save-as
```

## Node.js API
```
const PSA = require("page-save-as");
await PSA({
    url: "xxx",
    name: "xxx",
    type: "jpg/png/pdf"
});
```
see [test.js](./test/test.js)

## API Default Options
see [option.js](./lib/option.js)

## CLI
```sh
#global install: 
npm i page-save-as -g
#execute command
psa <url> --name filename --type jpg
#uses "npx psa ..." for local install
```

## CLI Options
* -n, --name `<name>`  save filename
* -t, --type `<type>`    file type: jpg(default)/png/pdf
* -w, --width `<width>`    page width
* -s, --scroll    scroll to bottom
* -e, --edit    edit mode")
* -o, --output `<path>`    output path
* -ds, --delay `<s>`    delay in seconds
* -ts, --timeout `<s>`    timeout in seconds

## CHANGELOG

* 1.0.3
    * fixed filename

* 1.0.2
    * fixed output
    * added delay
    * updated scroll logic
    * updated edit complete logic
    * updated puppeteer-chromium-resolver to latest

* 1.0.1
    * fixed filename