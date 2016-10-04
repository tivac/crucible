/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
         
    out = {};

describe("Crucible", () => {
    before(() => require("./lib/rollup")("./src/types/lib/label.js", out));

    describe("/types/lib/label", () => {
        var label;
        
        before(() => {
            label = out.exports;
        });
        
        it("should return a <label>", () => {
            var out = query(label({
                        id : "id"
                    }, {
                        field : {
                            name : "name"
                        }
                }));
            
            assert(out.has("label"));
            assert(out.has("label[for=id]"));
            assert(out.has("label[class$=label]"));
            
            assert(out.contains("name"));
        });
        
        it("should return a <label> for required fields", () => {
            var out = query(label({
                        id : "id"
                    }, {
                        field : {
                            name     : "name",
                            required : true
                        }
                }));
            
            assert(out.has("label"));
            assert(out.has("label[for=id]"));
            assert(out.has("label[class*=label]"));
            assert(out.has("label[class$=required]"));
            
            assert(out.contains("name*"));
        });
    });
});
