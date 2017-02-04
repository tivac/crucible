"use strict";

const spriter = require("svg-spritzer"),

    fsp = require("fs-promise"),

    glob = "./src/icons/*.svg";

module.exports = function() {
    spriter(glob)
        .then(fsp.writeFile.bind(fsp, "./gen/icons.svg"));
};
