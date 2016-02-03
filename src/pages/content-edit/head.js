"use strict";

var m      = require("mithril"),
    moment = require("moment"),
    
    css = require("./head.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.publish = function() {
            ref.child("published").set(moment().subtract(10, "seconds").valueOf());
        };
        
        ctrl.publishAt = function(start, end) {
            if(!ctrl.start || !ctrl.start.isValid()) {
                // TODO: Really Handle these errors
                return console.error("Invalid start");
            }

            ref.update({
                published   : ctrl.start.valueOf(),
                unpublished : ctrl.end.valueOf()
            });
        };

        ctrl.unpublish = function() {
            ref.child("published").remove();
        };
        
        ctrl.save = function() {
            ref.child("fields").set(options.data.fields);
        };
    },
    
    view : function(ctrl, options) {
        var now    = Date.now(),
            status = "draft";
            
        if(options.data.published > now) {
            status = "scheduled";
        }
        
        if(options.data.published < now) {
            status = "published";
        }
        
        return m("div", { class : css.head },
            m("p", { class : css.status },
                status
            ),
            m("button", {
                    class   : css.save,
                    onclick : ctrl.save,
                    title   : "Save your changes"
                },
                m("svg", { class : css.icon },
                    m("use", { href : "/src/icons.svg#save" })
                ),
                "Save"
            ),
            m("div", { class : css.publishing },
                m("button", { class : css.schedule },
                    m("svg", { class : css.icon },
                        m("use", { href : "/src/icons.svg#calendar" })
                    ),
                    "Schedule"
                ),
                m("button", { class : css.publish },
                    m("svg", { class : css.icon },
                        m("use", { href : "/src/icons.svg#calendar" })
                    ),
                    "Publish"
                )
            )
        );
    }
};
