/* eslint no-shadow:0 */
"use strict";

var t = require("tap"),
    mq  = require("mithril-query"),
    
    out = {};

// Compile code w/ rollup
t.beforeEach(() => require("./lib/rollup")("./src/types/lib/hide.js", out));

t.test("hide", (t) => {
    var hide = out.exports;
    
    t.test("returns false if not configured to hide", (t) => {
        t.notOk(hide({}));
        
        t.end();
    });
        
    t.end();
});
