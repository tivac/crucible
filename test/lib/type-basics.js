var assert = require("better-assert"),
    query  = require("mithril-query"),
    merge  = require("lodash.merge"),
    
    state = require("./state");
    
module.exports = function(args) {
    var options = state(args);
    
    it("should render", function() {
        var instance = new this.controller(options),
            out      = query(this.view(instance, options));
            
        assert(out.has("div"));
    });
    
    it("should render hidden", function() {
        var instance = new this.controller(options),
            out      = query(this.view(instance, merge({}, options, {
                field : {
                    show : {
                        field : "fooga"
                    }
                }
            })));
            
        assert(out.has(".hidden"));
    });
    
    it("should respect options.class", function() {
        var instance = new this.controller(options),
            out  = query(this.view(instance, merge({}, options, {
                class : "fooga"
            })));
        
        assert(out.has(".fooga"));
    });
};
