import m from "mithril";

import config, { icons } from "../../config";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";
import * as scheduleBox from "./schedule-box.js";

import css from "./head.css";

export function view(ctrl_unused, options) {
    var content = options.content,
        schedule = content.schedule,
        state = content.get(),
        locked  = config.locked;


    return m("div", { class : css.head },
        m("div", { class : css.main },

            // Controls
            m("div", { class : css.actions }, [
                m("a", {
                        // Attrs
                        class  : css.back,
                        title  : "Back to Listing",
                        href   : prefix("/listing/" + state.schema.key),
                        config : m.route
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#arrow" })
                    ),
                    "Back"
                ),

                m("button", {
                        // Attrs
                        class    : css.save,
                        title    : "Save your changes",
                        disabled : locked || !state.meta.dirty || null,

                        // Events
                        onclick : state.ui.saving ?
                            null :
                            function() {
                                content.save();
                            }   
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#save" })
                    ),
                    state.ui.saving ? "SAVING..." : "Save"
                )
            ]),

            // Publishing
            m("div", { class : css.publishing },
                // Schedule
                m("button", {
                        // Attrs
                        class : css.schedule,
                        title : "Schedule a publish",

                        // Events
                        onclick : function() {
                            content.toggleSchedule();
                        }
                    },
                    m("svg", { class : css.onlyIcon },
                        m("use", {
                            href : icons + "#schedule",
                            fill : state.dates.validSchedule ? "white" : "red"
                        })
                    )
                ),

                // Publish
                m("div", { class : css.publishContainer },
                    m("button", {
                            // Attrs
                            class    : css.publish,
                            title    : (state.meta.status === "published") ? "Already Published" : "",
                            disabled : locked || null,

                            // Events
                            onclick : function() {
                                schedule.publish();
                            }
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : icons + "#publish" })
                        ),
                        "Publish"
                    ),
                    !state.form ?
                        null :
                        m.component(invalidMsg, { content : content }) 
                ),

                // Unpublish
                m("button", {
                        // Attrs
                        class    : css.unpublish,
                        disabled : locked || null,

                        // Events
                        onclick : function() {
                            schedule.unpublish();
                        }
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#remove" })
                    ),
                    "Unpublish"
                )
            ),

            // Schedule Pop Up
            !state.ui.schedule ?
                null :
                m.component(scheduleBox, options)
        )
    );
}
