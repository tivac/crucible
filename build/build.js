"use strict";

var fs = require("fs"),
    
    rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    files  = require("./lib/files"),
    config = require("./lib/rollup")(),
    
    start;

files.copy();

start = Date.now();

rollup(config)
    .then((bundle) => bundle.write(config))
    .then(() => {
        console.log("Bundle written to ./gen/index.js in %s", duration(Date.now() - start));
        console.log("Bundle size: %s", size(fs.lstatSync(config.dest).size));
    })
    .catch((error) => console.error(error.stack));
