/* eslint no-shadow:0 */
"use strict";

var t = require("tap"),
    mq  = require("mithril-query"),
    
    instructions = {};

// Compile code w/ rollup
t.beforeEach(() => require("./lib/rollup")("./src/types/instructions.js", instructions));

t.test("instructions", (t) => {
    t.test("view exists", (t) => {
        t.equal(typeof instructions.view, "function");
        
        t.end();
    });
        
    t.test("view renders", (t) => {
        var out = instructions.view(null, {
                field : {}
            });
        
        t.same(out, {
            tag   : "div",
            attrs : {
                class : null
            },
            children : [ null, null ]
        });
        
        t.end();
    });
    
    t.test("view renders hidden", (t) => {
        var out = mq(instructions.view(null, {
                state : {},
                field : {
                    show : {
                        field : "fooga"
                    }
                }
            }));
        
        t.ok(out.has(".hidden"));
        
        t.end();
    });
    
    t.test("view respects options.class", (t) => {
        var out = mq(instructions.view(null, {
                field : {},
                class : "fooga"
            }));
        
        t.ok(out.has(".fooga"));
        
        t.end();
    });
    
    t.test("view renders head", (t) => {
        var out = mq(instructions.view(null, {
                field : {
                    head : "head"
                }
            }));
        
        t.ok(out.has("div > p[class$=head]"));
        t.ok(out.contains("head"));
        
        t.end();
    });
    
    t.test("view renders body", (t) => {
        var out = mq(instructions.view(null, {
                field : {
                    body : "body"
                }
            }));
        
        t.ok(out.contains("body"));
        
        t.end();
    });
    
    t.end();
});
