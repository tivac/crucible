"use strict";

var m      = require("mithril"),
    moment = require("moment"),

    css = require("./publishing.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.now  = moment();
        ctrl.date = false;

        ctrl.publish = function(e) {
            options.ref.child("_published").set(moment().subtract(10, "seconds").valueOf());
        };

        ctrl.publishAt = function(e) {
            if(!ctrl.date || !ctrl.date.isValid()) {
                return console.error("Invalid date"); // TODO: Really Handle
            }

            options.ref.child("_published").set(ctrl.date.valueOf());
        };

        ctrl.unpublish = function(e) {
            options.ref.child("_published").remove();
        };
    },

    view : function(ctrl, options) {
        var published = options.data._published && moment(options.data._published);

        if(published) {
            return m("div", { class : options.class },
                m("span",
                    published.isBefore(ctrl.now) ?
                        "Published at " + published.format("lll") :
                        "Publishing at " + published.format("lll")
                ),
                m("button", {
                    onclick : ctrl.unpublish
                }, "Unpublish")
            );
        }
        
        return m("div", { class : options.class },
            m(".pure-form",
                m("label",
                    m("input", {
                        type    : "datetime-local",
                        value   : (ctrl.date || ctrl.now).format("YYYY-MM-DD[T]HH:mm"),
                        oninput : m.withAttr("value", function(value) {
                            ctrl.date = moment(value, "YYYY-MM-DD[T]HH:mm");
                        })
                    })
                ),
                m("button", {
                    // Attrs
                    class    : css[options.enabled ? "publish" : "disabled"],
                    disabled : !options.enabled,
                    
                    // Events
                    onclick  : ctrl.publishAt
                }, "Publish")
            )
        );
    }
};
