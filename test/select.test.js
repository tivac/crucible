/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    select = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/select.js", select));
    
    describe.skip("/types/select", function() {
        var view;
        
        before(() => {
            view = select.exports.view;
        });
        
        it("should exist", () => {
            assert(typeof view === "function");
        });
            
        it("should render", () => {
            var out = query(view(null, {
                    field : {}
                }));
            
            assert(out.has("div"));
        });
        
        it("should render hidden", () => {
            var out = query(view(null, {
                    state : {},
                    field : {
                        show : {
                            field : "fooga"
                        }
                    }
                }));
            
            assert(out.has(".hidden"));
        });
        
        it("should respect options.class", () => {
            var out = query(view(null, {
                    field : {},
                    class : "fooga"
                }));
            
            assert(out.has(".fooga"));
        });
        
    });
});
