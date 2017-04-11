"use strict";

var chokidar = require("chokidar"),
    shell    = require("shelljs"),

    files = {
        "./src/pages/schema-edit/parse-schema.js" : "./gen/parse-schema.js"
    };

exports.watch = function() {
    // Make sure files stay up to date in the /gen folder
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
