const defaultOption = {
    url: '',
    name: '',
    type: 'jpg',
    width: 1280,
    edit: false,
    scroll: false,
    output: './',
    delay: 1,
    timeout: 60,

    imageOption: {
        fullPage: true,
        quality: 100
    },

    //https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagepdfoptions
    pdfOption: {
        //format: "A4",
        landscape: true,
        // headerTemplate: "<p>Header</p>",
        // footerTemplate: "<p>Footer</p>",
        // displayHeaderFooter: true,
        margin: {
            left: '10px',
            right: '10px',
            top: '20px',
            bottom: '20px'
        },
        printBackground: true
    }
};

module.exports = defaultOption;
