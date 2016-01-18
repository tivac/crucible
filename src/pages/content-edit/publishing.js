"use strict";

var m      = require("mithril"),
    moment = require("moment"),

    css = require("./publishing.css");

module.exports = {
    controller : function(options) {
        var ctrl = this;

        ctrl.now  = moment();
        ctrl.date = false;

        ctrl.publish = function() {
            options.ref.child("published").set(moment().subtract(10, "seconds").valueOf());
        };

        ctrl.publishAt = function() {
            if(!ctrl.date || !ctrl.date.isValid()) {
                // TODO: Really Handle these errors
                return console.error("Invalid date");
            }

            options.ref.child("published").set(ctrl.date.valueOf());
        };

        ctrl.unpublish = function() {
            options.ref.child("published").remove();
        };
    },

    view : function(ctrl, options) {
        var published = options.data.published && moment(options.data.published);

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
                        class   : css.date,
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
