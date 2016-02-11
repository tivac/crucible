"use strict";

var m      = require("mithril"),
    moment = require("moment"),
    
    css = require("./schedule.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.start = false;
        ctrl.end   = false;

        ctrl.publishAt = function() {
            if(!ctrl.start || !ctrl.start.isValid()) {
                // TODO: Really Handle these errors
                return console.error("Invalid start");
            }

            options.ref.update({
                published   : ctrl.start.valueOf(),
                unpublished : ctrl.end.valueOf()
            });
        };
    },

    view : function(ctrl, options) {
        return m("button", { class : css.schedule },
            m("svg", { class : css.icon },
                m("use", { href : "/src/icons.svg#calendar" })
            ),
            "Schedule"
        );
    }
};
