"use strict";

var m      = require("mithril"),
    moment = require("moment"),

    css = require("./publish.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.now  = moment();
        ctrl.date = false;
        ctrl.open = false;

        ctrl.publish = function() {
            options.ref.child("published").set(moment().subtract(10, "seconds").valueOf());
        };

        ctrl.unpublish = function() {
            options.ref.child("published").remove();
        };
    },

    view : function(ctrl, options) {
        return m("button", { class : css.publish },
            m("svg", { class : css.icon },
                m("use", { href : "/src/icons.svg#calendar" })
            ),
            "Publish"
        );
    }
};
