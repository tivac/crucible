"use strict";

var m      = require("mithril"),
    assign = require("lodash.assign"),
    set    = require("lodash.set"),

    db     = require("../lib/firebase"),
    update = require("../lib/update"),
    types  = require("./index"),
    
    css = require("./tabs.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.tab = "tab-0";

        ctrl.addtab = function(e) {
            e.preventDefault();
            
            ref.child("tabs").once("value", function(snap) {
                var id = "tab-" + snap.numChildren();
                
                snap.ref().child(id).setWithPriority({
                    name : "Tab"
                }, snap.numChildren());
                
                ctrl.tab = id;
            });
        };
        
        ctrl.switchtab = function(tab, e) {
            e.preventDefault();
            
            ctrl.tab = tab;
        };
    },

    view : function(ctrl, options) {
        var details = options.details;

        return m("div",
            m("p",
                m("label",
                    "Name: ",
                    m("input", {
                        oninput : m.withAttr("value", update.bind(null, options.ref, "name")),
                        value   : details.name || "",
                        config  : function(el, init) {
                            if(init) {
                                return;
                            }
                            
                            el.select();
                        }
                    })
                )
            ),
            m("div",
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
                        }),
                        m("li", { class : css["item-new"].join(" ") },
                            m("a", {
                                href    : "#add-tab",
                                class   : css.link.join(" "),
                                onclick : ctrl.addtab
                            }, "Add Tab")
                        )
                    )
                ),
                Object.keys(details.tabs || {}).map(function(key) {
                    var tab = details.tabs[key];

                    return m("div", { class : css[key === ctrl.tab ? "contents-active" : "contents"].join(" ") },
                        m("p",
                            m("label",
                                "Tab Name: ",
                                m("input", {
                                    value   : tab.name || "",
                                    oninput : m.withAttr("value", update.bind(null, options.ref, "tabs/" + key + "/name"))
                                })
                            )
                        ),
                        m.component(types.components.fields.edit, {
                            details : tab,
                            ref     : options.ref.child("tabs/" + key)
                        })
                    );
                })
            )
        );
    }
};
