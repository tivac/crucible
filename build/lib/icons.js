"use strict";

var chokidar = require("chokidar"),
    shell    = require("shelljs"),
    globule  = require("globule"),
    svgstore = require("svgstore"),
    fs       = require("fs"),
    path     = require("path"),

    source = "./src/**/*.svg",
    dest   = "./gen/icons.svg";

exports.watch = function() {
    let icons = svgstore();

    chokidar.watch(globule.find(source)).on("all", function(event, file) {
        if(event !== "add" && event !== "change") {
            return;
        }

        file = "./" + file;

        // icons = icons.add(path.parse(file).name, fs.readFileSync(file, "utf8"));
    });
};

exports.store = function() {
    let icons = svgstore();

    globule.find(source).forEach(function(file) {
        icons = icons.add(path.parse(file).name, fs.readFileSync(file, "utf8"));
    });

    fs.writeFileSync(dest, icons.toString());
};
