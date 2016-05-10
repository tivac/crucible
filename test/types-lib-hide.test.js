/* eslint no-shadow:0 */
"use strict";

var assert = require("better-assert"),
    query  = require("mithril-query"),
    
    out = {};

describe("Anthracite", () => {
    before(() => require("./lib/rollup")("./src/types/lib/hide.js", out));

    describe("/types/lib/hide", () => {
        var hide;
        
        before(() => {
            hide = out.exports;
        });
        
        it("should return false if not configured to hide", () => {
            assert(hide({}) === false);
        });
        
        it("should return false if values match (value)", () => {
            var out = hide({
                    state : {
                        fooga : true
                    },
                    
                    field : {
                        show : {
                            field : "fooga",
                            value : true
                        }
                    }
                });
            
            assert(!out);
        });
        
        it("should return false if values match (regexp)", () => {
            var out = hide({
                    state : {
                        fooga : "wooga"
                    },
                    
                    field : {
                        show : {
                            field : "fooga",
                            type  : "regexp",
                            value : ".ooga"
                        }
                    }
                });
            
            assert(!out);
        });
        
        it("should return an empty div if values don't match (value)", () => {
            var out = query(hide({
                    state : {
                        fooga : true
                    },
                    
                    field : {
                        show : {
                            field : "fooga",
                            value : false
                        }
                    }
                }));
            
            assert(out.has(".hidden"));
        });
        
        it("should return an empty div if values don't match (regexp)", () => {
            var out = query(hide({
                    state : {
                        fooga : "wooga"
                    },
                    
                    field : {
                        show : {
                            field : "fooga",
                            type  : "regexp",
                            value : "fooga"
                        }
                    }
                }));
            
            assert(out.has(".hidden"));
        });
    });
});
