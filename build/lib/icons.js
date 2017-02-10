"use strict";

var chokidar = require("chokidar"),
    shell    = require("shelljs"),
    globule  = require("globule"),
    svgstore = require("svgstore"),
    fs       = require("fs"),

    source = "./src/**/*.svg",
    dest   = "./gen/icons.svg";

exports.watch = function() {
    // Make sure icons stay up to date
    chokidar.watch(globule.find(source)).on("all", function(event, file) {
        if(event !== "add" && event !== "change") {
            return;
        }

        file = "./" + file;

    });
};

exports.store = function() {
    globule.find(source).forEach(function(file) {
        console.log(file);
        svgstore().add(file, fs.readFileSync(file, "utf8"));
    });

    console.log(svgstore().toString());
};
