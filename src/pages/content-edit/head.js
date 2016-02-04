"use strict";

var m      = require("mithril"),
    moment = require("moment"),
    
    css = require("./head.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref;
        
        ctrl.schedule   = false;
        ctrl.unschedule = false;
        
        ctrl.toggle = function(force) {
            ctrl.schedule = typeof force !== "undefined" ? Boolean(force) : !ctrl.schedule;
        };
        
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
            !ctrl.schedule ? [
                m("p", { class : css.status },
                    status
                ),
                m("div", { class : css.actions },
                    m("button", {
                            // Attrs
                            class : css.save,
                            title : "Save your changes",
                            
                            // Events
                            onclick : ctrl.save
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : "/src/icons.svg#save" })
                        ),
                        "Save"
                    )
                ),
                m("div", { class : css.publishing },
                    m("button", {
                            // Attrs
                            class : css.schedule,
                            title : "Schedule a publish",
                            
                            // Events
                            onclick : ctrl.toggle.bind(null, undefined)
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : "/src/icons.svg#calendar" })
                        ),
                        "Schedule"
                    ),
                    m("button", {
                            // Attrs
                            class : css.publish,
                            title : "Publish now",
                            
                            // Events
                            onclick : ctrl.publish
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : "/src/icons.svg#calendar" })
                        ),
                        "Publish"
                    )
                )
            ] : [
                m("button", {
                        // Attrs
                        class : css.back,
                        title : "Go back",
                        
                        // Events
                        onclick : ctrl.toggle.bind(null, undefined)
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : "/src/icons.svg#arrow" })
                    ),
                    "Back"
                ),
                m("label", { for : "publish_at" }, "Publish at"),
                m("input", {
                    type : "datetime-local",
                    id   : "publish_at"
                }),
                m("label", { for : "publish_until" }, "until"),
                (!ctrl.unschedule ?
                    m("a", {
                        href : "#unpublish",
                        
                        onclick : function(e) {
                            e.preventDefault();
                            
                            ctrl.unschedule = true;
                        }
                    }, "Forever") :
                    m("input", {
                        type : "datetime-local",
                        id   : "publish_until"
                    })),
                 m("button", {
                        // Attrs
                        class : css.publish,
                        title : "Schedule publish"
                        
                        // Events
                        // onclick : ctrl.publish
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : "/src/icons.svg#calendar" })
                    ),
                    "Schedule"
                )
            ]
        );
    }
};
