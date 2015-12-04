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
        var tabs = Object.keys(options.details.tabs || {});
        
        return m("div",
            m("div", { class : css.nav.join(" ") },
                m("ul", { class : css.list.join(" ") },
                    tabs.map(function(key) {
                        return m("li", { class : css[key === ctrl.tab ? "item-active" : "item"].join(" ") },
                            m("a", {
                                href    : "#" + key,
                                class   : css.link.join(" "),
                                onclick : ctrl.switchtab.bind(ctrl, key)
                            }, key)
                        );
                    })
                )
            ),
            tabs.map(function(key) {
                console.log(key, options.details.tabs[key]);
                
                return m("div", { class : css[key === ctrl.tab ? "contents-active" : "contents"].join(" ") },
                    m.component(types.components.fields, {
                        ref     : options.ref && options.ref.child(key),
                        // data    : ctrl.entry,
                        details : options.details.tabs[key]
                    })
                );
            })
        );
    }
};
