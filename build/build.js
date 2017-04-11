/* eslint no-console:false */
"use strict";

var rollup   = require("rollup").rollup,
    duration = require("humanize-duration"),
    size     = require("filesize"),

    argv = require("minimist")(process.argv.slice(2)),

    files  = require("./lib/files"),
    config = require("./lib/rollup")(argv),

    start = Date.now();

files.copy();

rollup(config)
    .then((bundle) => bundle.write(config))
    .then(() => {
        console.log("Bundle written in %s", duration(Date.now() - start));
    })
    .catch((error) => {
        console.error(error.toString());
        console.error(error.stack)
    });
