/* eslint no-console:false */
"use strict";

var rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    argv = require("minimist")(process.argv.slice(2)),

    files  = require("./lib/files"),
    icons  = require("./lib/icons"),
    config = require("./lib/rollup")(argv),

    start = Date.now();

files.copy();
icons.store();

rollup(config)
    .then((bundle) => bundle.write(config))
    .then(() => {
        console.log("Bundle written to ./gen/index.js in %s", duration(Date.now() - start));
    })
    .catch((error) => {
        console.error(error.toString());
        console.error(error.stack)
    });
