"use strict";

var CodeMirror = require("codemirror"),
    jsonlint   = require("jsonlint");

CodeMirror.registerHelper("lint", "json", function(text) {
    var found = [];

    // Override default jsonlint error behavior so we can catalog them
    jsonlint.parser.parseError = function(str, details) {
        var loc = details.loc;
        
        found.push({
            from    : CodeMirror.Pos(loc.first_line - 1, loc.first_column),
            to      : CodeMirror.Pos(loc.last_line - 1, loc.last_column),
            message : str
        });
    };

    try {
        jsonlint.parse(text);
    } catch(e) {
        // NO-OP: these aren't actionable
    }
    
    return found;
});
