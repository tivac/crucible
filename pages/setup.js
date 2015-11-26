"use strict";

var m = require("mithril");

module.exports = {
    controller : function() {
        var ctrl = this;
        
        ctrl.root  = m.prop("");
        ctrl.error = false;
        
        ctrl.onclick = function(e) {
            e.preventDefault();
            
            if(ctrl.root().length) {
                localStorage.setItem("crucible-root", ctrl.root());
                
                return m.route("/");
            }
            
            ctrl.error = true;
        }
    },

    view : function(ctrl) {
        return [
            m("h1", "CRUCIBLE SETUP"),
            
            m("p",
                "Enter your firebase root"
            ),
            m("form",
                m("div",
                    m("input[type=url]", { oninput : m.withAttr("value", ctrl.root) })
                ),
                m("div",
                    m("button", { onclick : ctrl.onclick }, "Finish")
                )
            )
        ];
    }
};
