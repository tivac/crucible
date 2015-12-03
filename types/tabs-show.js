"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    get    = require("lodash.get"),
    
    types = require("./index"),
    
    css = require("./tabs.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.tab = "tab-0";
        
        ctrl.switchtab = function(tab, e) {
            e.preventDefault();
            
            ctrl.tab = tab;
        };
    },
    view : function(ctrl, options) {
        var details = options.details;
        
        return m("div",
            m("div", { class : css.nav.join(" ") },
                m("ul", { class : css.list.join(" ") },
                    Object.keys(details.tabs || {}).map(function(key) {
                        return m("li", { class : css[key === ctrl.tab ? "item-active" : "item"].join(" ") },
                            m("a", {
                                href    : "#" + key,
                                class   : css.link.join(" "),
                                onclick : ctrl.switchtab.bind(ctrl, key)
                            }, details.tabs[key].name)
                        );
                    })
                )
            ),
            Object.keys(details.tabs || {}).map(function(key) {
                var tab = details.tabs[key];

                return m("div", { class : css[key === ctrl.tab ? "contents-active" : "contents"].join(" ") },
                    Object.keys(tab.fields || {}).map(function(fieldKey) {
                        var field = tab.fields[fieldKey];

                        return m("div",
                            m.component(types.components[field.type].show, {
                                ref     : options.ref.child(key).child(fieldKey),
                                data    : get(options.data, key + "." + fieldKey),
                                details : field
                            })
                        );
                    })
                );
            })
        );
    }
};
