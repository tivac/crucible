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
        debouncedWrite;

    function writeStore() {
        console.log("write file");

        fs.writeFileSync(dest, icons.toString());

        console.log("wrote file");
    }

    debouncedWrite = debounce(writeStore, 100, {
        leading  : true,
        trailing : false,
        maxWait  : 500
    });

    chokidar.watch(globule.find(source)).on("all", function(event, file) {
        let name = path.parse(file).name;

        if(event !== "add" && event !== "change") {
            return;
        }

        file = "./" + file;

        // remove icon if already in sprite
        icons.element(`#${name}`).remove();
        // add icon;
        icons = icons.add(path.parse(file).name, fs.readFileSync(file, "utf8"));

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
