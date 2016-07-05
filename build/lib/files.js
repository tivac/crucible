"use strict";

var chokidar = require("chokidar"),
    shell    = require("shelljs"),

    files = {
        "./src/pages/schema-edit/parse-schema.js" : "./gen/parse-schema.js",
        "./src/icons.svg"                         : "./gen/icons.svg"
    };

exports.watch = function() {
    // Make sure icons stay up to date
    chokidar.watch(Object.keys(files)).on("all", function(event, file) {
        if(event !== "add" && event !== "change") {
            return;
        }
        
        file = "./" + file;
        
        shell.cp(file, files[file]);
    });
};

exports.copy = function() {
    Object.keys(files).forEach(function(file) {
        shell.cp(file, files[file]);
    });
};

exports.dir = function() {
    require("shelljs").mkdir("-p", "./gen");
};
