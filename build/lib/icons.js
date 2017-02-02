"use strict";

var fs      = require("fs"),
    path    = require("path"),
    shell   = require("shelljs"),
    globule = require("globule"),
    Spriter = require("svg-sprite"),

    dest = "./gen",

    spriter;

module.exports = function() {
    var files = globule.find([
            "./src/**/*.svg",
            "!./src/icons.svg"
        ]);

    spriter = new Spriter({
        dest : dest,
        mode : {
            symbol : {
                inline : true,
                dest   : dest,
                defs   : true
            }
        }
    });

    files.forEach(function(file) {
        let data = fs.readFileSync(file, "utf8"),
            filePath = path.resolve(file);

        console.log(file);

        spriter.add(
            filePath,
            null,
            data
        );
    });

    spriter.compile(function(err, res, data) {
        if(err) {
            console.log("Error: " + err);

            return;
        }

        fs.writeFile(path.join(dest, "icons.svg"), res.symbol.sprite._contents, function(err) {
            if(err) {
                console.log("Error: " + err);

                return;
            }

            console.log("Done!");
        });
    });
};
