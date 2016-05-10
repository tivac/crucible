var assert = require("better-assert"),
    query  = require("mithril-query"),
    merge  = require("lodash.merge");
    
module.exports = function(options) {
    var opts = merge({}, {
            path    : [],
            details : {
                key : "name"
            }
        }, options || {});
    
    it("should render", function() {
        var instance = new this.controller(opts),
            out  = query(this.view(instance, merge({}, {
                field : {}
            }, opts)));
            
        assert(out.has("div"));
    });
    
    it("should render hidden", function() {
        var instance = new this.controller(opts),
            out  = query(this.view(instance, merge({}, {
                state : {},
                field : {
                    show : {
                        field : "fooga"
                    }
                }
            }, opts)));
            
        assert(out.has(".hidden"));
    });
    
    it("should respect options.class", function() {
        var instance = new this.controller(opts),
            out  = query(this.view(instance, merge({}, {
                field : {},
                class : "fooga"
            }, opts)));
        
        assert(out.has(".fooga"));
    });
};
