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
psa <url> <name> --type jpg
```

## Options

* --type  save type
* --width  Page width  [default: 1920]
* --edit   edit mode


## CHANGELOG

* 1.0.0