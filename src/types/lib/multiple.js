"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),

    id    = require("./id"),
    hide  = require("./hide"),
    
    css = require("./types.css");

module.exports = function(args, view) {
    return {
        controller : function(options) {
            var ctrl = this;

            ctrl.id = id(options);

            // Decorate children w/ their selection status
            ctrl.selected = function(options) {
                var details = options.details,
                    values  = options.data,
                    matches;
                
                if(!values) {
                    return;
                }
                
                matches = details.children.filter(function(opt) {
                    if(!args.multiple) {
                        return opt.value === values;
                    }
                    
                    return values[opt.key] === opt.value;
                });
                
                if(!args.multiple && matches.length) {
                    matches.length = 1;
                }
                
                details.children = details.children.map(function(opt) {
                    opt.selected = matches.indexOf(opt) > -1;
                    
                    return opt;
                });
            };
            
            ctrl.value = function(options, key, value) {
                return options.update(
                    args.multiple ? options.path.concat(key) : options.path,
                    value
                );
            };
        },

        view : function(ctrl, options) {
            var details = options.details,
                hidden  = hide(options),
                match;
            
            if(hidden) {
                return hidden;
            }

            if(details.required) {
                details.name += "*";
            }
            
            ctrl.selected(options);

            return m("div", { class : options.class },
                m("label", {
                    class : css[details.required ? "required" : "label"]
                }, details.name),
                view(ctrl, options)
            );
        }
    }
};
