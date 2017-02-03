"use strict";

const svgSpriter = require("svg-spriter"),

    glob = [
        "./src/icons/*.svg"
        // ,
        // "!./src/icons.svg"
    ];

module.exports = function() {
    console.log("things");
    svgSpriter({
        input : {
            svg : glob
        },
        output : {
            sprite : "./gen/icons.svg",
            css    : "./gen/icons.css"
        }
    });

    console.log("things2");
};
