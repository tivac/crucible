"use strict";

var m = require("mithril"),

    db = require("../lib/firebase");

module.exports = {
    controller : function() {
        var ctrl  = this,
            types = db.child("types");
        
        ctrl.types = null;
        ctrl.name  = m.prop("");
        ctrl.type  = m.prop(false);
        
        types.on("value", function(snap) {
            ctrl.types = snap.val();
            ctrl.type(Object.keys(ctrl.types).shift());
            
            m.redraw();
        });
        
        ctrl.onsubmit = function(e) {
            var id;

            e.preventDefault();

            id = db.child("content").push({
                name : ctrl.name(),
                type : ctrl.type(),
                data : {}
            });

            m.route("/content/" + id.key());
        };
    },

    view : function(ctrl) {
        if(!ctrl.types) {
            return m("h1", "Loading...");
        }
        
        return [
            m("h1", "Add Content"),
            m("form", { onsubmit : ctrl.onsubmit },
                m("label",
                    "Name: ",
                    m("input[name=name]", { oninput : m.withAttr("value", ctrl.name), value : ctrl.name() })
                ),
                m("fieldset",
                    m("legend", "Content type"),
                    Object.keys(ctrl.types).map(function(type, idx) {
                        return m("p",
                            m("label",
                                m("input[type=radio][name=type]", {
                                    value    : type,
                                    checked  : idx === 0,
                                    onchange : m.withAttr("checked", function(checked) {
                                        if(!checked) {
                                            return;
                                        }
                                        
                                        ctrl.type(type);
                                    })
                                }),
                                ctrl.types[type].name
                            )
                        );
                    })
                ),
                m("div",
                    m("input[type=submit]", { value : "Add" })
                )
            )
        ];
    }
};
