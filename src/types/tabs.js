"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    
    children = require("./children"),

    css = require("./tabs.css");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.tab = 0;

        ctrl.switchtab = function(tab, e) {
            e.preventDefault();
            
            ctrl.tab = tab;
        };
    },
    view : function(ctrl, options) {
        var tabs = options.details.children || [];

        return m("div", { class : options.class },
            m("div", { class : css.nav },
                tabs.map(function(tab, idx) {
                    return m("a", {
                            class   : css[idx === ctrl.tab ? "item-active" : "item"],
                            href    : "#" + idx,
                            onclick : ctrl.switchtab.bind(ctrl, idx)
                        }, tab.name
                    );
                })
            ),
            tabs.map(function(tab, idx) {
                return m("div", { class : css[idx === ctrl.tab ? "contents-active" : "contents"] },
                    m.component(children, assign({}, options, {
                        details : tab.children,
                        data    : options.data && options.data[tab.slug],
                        ref     : options.ref  && options.ref.child(tab.slug),
                    }))
                );
            })
        );
    }
};
