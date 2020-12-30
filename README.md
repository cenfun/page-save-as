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

## CLI
```sh
#for global install: npm i page-save-as -g
psa <url> <name> --type jpg
#uses "npx psa ..." for local install
```

## Options

* --type  save type: jpg(default)/png/pdf
* --width  page width  [default: 1920]
* --edit   edit mode, will open page, press F12 into devtool to edit page elements util click OK 
* --scroll  scroll to bottom for lazy load
* --output  output path
* --quality  quality for jpg format


## CHANGELOG

* 1.0.1
    * fixed filename