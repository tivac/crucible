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
        var tabs = options.details.children || [];

        return m("div", { class : css[options.index ? "field" : "first"].join(" ") },
            m("div", { class : css.nav.join(" ") },
                tabs.map(function(tab, idx) {
                    return m("a", {
                            class   : css[idx === ctrl.tab ? "item-active" : "item"].join(" "),
                            href    : "#" + idx,
                            onclick : ctrl.switchtab.bind(ctrl, idx)
                        }, tab.name
                    );
                })
            ),
            tabs.map(function(tab, idx) {
                return m("div", { class : css[idx === ctrl.tab ? "contents-active" : "contents"].join(" ") },
                    m.component(children, {
                        ref     : options.ref && options.ref.child(tab.slug),
                        data    : get(options, "data." + tab.slug),
                        details : tab.children
                    })
                );
            })
        );
    }
};
