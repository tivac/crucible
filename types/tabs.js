"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    get    = require("lodash.get"),
    
    children = require("./children"),

    css = require("./tabs.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.tab = 0;

        ctrl.switchtab = function(tab, e) {
            e.preventDefault();
            
            ctrl.tab = tab;
        };
    },
    view : function(ctrl, options) {
        var tabs = options.details.tabs || [];

        return m("div", { class : css[options.index ? "field" : "first"].join(" ") },
            m("ul", { class : css.nav.join(" ") },
                tabs.map(function(tab, idx) {
                    return m("li", { class : css[idx === ctrl.tab ? "item-active" : "item"].join(" ") },
                        m("a", {
                            href    : "#" + idx,
                            class   : css.link.join(" "),
                            onclick : ctrl.switchtab.bind(ctrl, idx)
                        }, tab.name)
                    );
                })
            ),
            tabs.map(function(tab, idx) {
                return m("div", { class : css[idx === ctrl.tab ? "contents-active" : "contents"].join(" ") },
                    m.component(children, {
                        ref     : options.ref && options.ref.child(idx),
                        // data    : ctrl.entry,
                        details : tab.children
                    })
                );
            })
        );
    }
};
