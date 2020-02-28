const fs = require('fs');
const browserify = require("browserify");

browserify({ entries: ["src/js/index.js"] })
    .transform("babelify", {
        global: true,
        presets: ["@babel/env"]
    })
    .bundle()
    .pipe(fs.createWriteStream("dist/js/bundle.js"));