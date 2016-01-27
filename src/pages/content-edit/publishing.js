"use strict";

var m      = require("mithril"),
    moment = require("moment"),

    css = require("./publishing.css"),
    
    format = "YYYY-MM-DD[T]HH:mm",
    redraw = m.redraw.bind(m);

module.exports = {
    controller : function(options) {
        var ctrl = this;
        
        ctrl.date      = moment().format(format);
        ctrl.entry     = options.entry;
        ctrl.published = false;
        
        // Get data from the entry
        ctrl.entry.data(function(snap) {
            var data = snap.val(), 
                pub  = moment(data.published);
            
            if(pub.isValid()) {
                ctrl.date      = pub.format(format);
                ctrl.published = pub;
            }
            
            m.redraw();
        });

        ctrl.publishAt = function() {
            var date = moment(ctrl.date, format);
            
            if(!date.isValid()) {
                // TODO: Really Handle these errors
                return console.error("Invalid date");
            }
            
            ctrl.published = date;
            
            ctrl.entry.publish(date.valueOf());
        };
        
        ctrl.unpublish = function() {
            ctrl.published = false;
            
            ctrl.entry.unpublish();
        };
    },

    view : function(ctrl, options) {
        ctrl.entry = options.entry;
        
        if(ctrl.published) {
            return m("div", { class : options.class },
                m("span",
                    (ctrl.published.isBefore() ? "Published at " : "Publishing at ") + 
                    ctrl.published.format("lll")
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
                        value   : ctrl.date,
                        class   : css.date,
                        oninput : m.withAttr("value", function(value) {
                            ctrl.date = value;
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
