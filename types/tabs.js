"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    get    = require("lodash.get"),
    
    types = require("./index"),
    
    css = require("./tabs.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.switchtab = function(tab, e) {
            e.preventDefault();
            
            ctrl.tab = tab;
        };
    },
    view : function(ctrl, options) {
        var tabs = Object.keys(options.details.tabs || {}),
            tab  = ctrl.tab || tabs[0];

        return m("div", { class : css.nav.join(" ") },
            m("ul", { class : css.list.join(" ") },
                tabs.map(function(key) {
                    return m("li", { class : css[key === tab ? "item-active" : "item"].join(" ") },
                        m("a", {
                            href    : "#" + key,
                            class   : css.link.join(" "),
                            onclick : ctrl.switchtab.bind(ctrl, key)
                        }, key)
                    );
                })
            ),
            tabs.map(function(key) {
                return m("div", { class : css[key === tab ? "contents-active" : "contents"].join(" ") },
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
