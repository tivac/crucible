"use strict";

var m      = require("mithril"),
    moment = require("moment"),
    set    = require("lodash.set"),
    
    db = require("../../lib/firebase"),
    
    css = require("./head.css");

module.exports = {
    controller : function(options) {
        var ctrl = this,
            ref  = options.ref,
            user = db.getAuth().uid;
        
        ctrl.schedule   = false;
        ctrl.unschedule = false;
        
        ctrl.start = {};
        ctrl.end   = {};
        
        ctrl.toggle = function(force) {
            ctrl.schedule = typeof force !== "undefined" ? Boolean(force) : !ctrl.schedule;
        };
        
        ctrl.publish = function() {
            var start, end;
            
            if(ctrl.start.date) {
                start = moment(
                    ctrl.start.date + " " + (ctrl.start.time || "00:00"),
                    "YYYY-MM-DD HH:mm"
                );
            } else {
                start = moment().subtract(10, "seconds");
            }
            
            if(ctrl.end.date) {
                end = moment(
                    ctrl.end.date + " " + (ctrl.end.time || "00:00"),
                    "YYYY-MM-DD HH:mm"
                );
                
                if(end.isSameOrBefore(start)) {
                    // TODO: handle
                    return console.error("Invalid end date");
                }
            }
            
            ref.update({
                published_at   : start.valueOf(),
                published_by   : user,
                unpublished_at : end ? end.valueOf() : false,
                unpublished_by : end ? user : false
            });
        };

        ctrl.unpublish = function() {
            ref.child("published_at").remove();
            ref.child("published_by").remove();
            
            ref.update({
                unpublished_at : db.timestamp,
                unpublished_by : user
            });
        };
        
        ctrl.save = function() {
            ref.child("fields").set(options.data.fields);
        };
        
        ctrl.date = function(path, value) {
            set(ctrl, path, value);
        };
    },
    
    view : function(ctrl, options) {
        var now    = Date.now(),
            status = "draft";
            
        if(options.data.published_at > now) {
            status = "scheduled";
        }
        
        if(options.data.published_at < now) {
            status = "published";
        }
        
        return m("div", { class : css.head },
            m("div", { class : css.main },
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
            ),
            ctrl.schedule ? m("div", { class : css.details },
                m("div", { class : css.start },
                    m("p",
                        m("label", { for : "published_at_date" }, "Publish at")
                    ),
                    m("p",
                        m("input", {
                            class : css.date,
                            type  : "date",
                            id    : "published_at_date",
                                
                            // Events
                            oninput : m.withAttr("value", set.bind(null, ctrl, "start.date"))
                        })
                    ),
                    m("p",
                        m("input", {
                            class : css.date,
                            type  : "time",
                            id    : "published_at_time",
                                
                            // Events
                            oninput : m.withAttr("value", set.bind(null, ctrl, "start.time"))
                        })
                    )
                ),
                m("div", { class : css.end },
                    m("p",
                        m("label", { for : "unpublished_at_date" }, "Until (optional)")
                    ),
                    m("p",
                        m("input", {
                            class : css.date,
                            type  : "date",
                            id    : "unpublished_at_date",
                                                            
                            // Events
                            oninput : m.withAttr("value", set.bind(null, ctrl, "end.date"))
                        })
                    ),
                    m("p",
                        m("input", {
                            class : css.date,
                            type  : "time",
                            id    : "unpublished_at_time",
                                
                            // Events
                            oninput : m.withAttr("value", set.bind(null, ctrl, "end.time"))
                        })
                    )
                )
            ) : null
        );
    }
};
