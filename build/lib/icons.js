"use strict";

var chokidar = require("chokidar"),
    shell    = require("shelljs"),
    globule  = require("globule"),
    svgstore = require("svgstore"),
    fs       = require("fs"),
    path     = require("path"),
    debounce = require("lodash/debounce"),

    source = "./src/**/*.svg",
    dest   = "./gen/icons.svg";

exports.watch = function() {
    let icons = svgstore(),
        debouncedWrite = debounce(function() {
            fs.writeFileSync(dest, icons.toString());
        }, 100, { maxWait : 500 });

    chokidar.watch(globule.find(source)).on("all", function(event, file) {
        let name = path.parse(file).name;

        if(event !== "add" && event !== "change") {
            return;
        }

        file = "./" + file;

        // remove icon if already in sprite
        icons.element("#" + name).remove();
        // add icon;
        icons = icons.add(path.parse(file).name, fs.readFileSync(file, "utf8"));

        // on startup only write once for all icons
        debouncedWrite();
    });
};

exports.store = function() {
    let icons = svgstore();

    globule.find(source).forEach(function(file) {
        icons = icons.add(path.parse(file).name, fs.readFileSync(file, "utf8"));
    });

    fs.writeFileSync(dest, icons.toString());
};
