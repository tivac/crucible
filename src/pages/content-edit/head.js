import m from "mithril";

import config, { icons } from "../../config";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";
import * as scheduleBox from "./schedule-box.js";

import css from "./head.css";

export function view(ctrl, options) {
    var content  = options.content,
        schedule = content.schedule,
        state    = content.get(),
        locked   = config.locked;


    return m("div", { class : css.contentHd },
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
                            content.save.bind(content)
                    },
                    m("svg", { class : css.icon },
                        m("use", { href : icons + "#save" })
                    ),
                    state.ui.saving ? "SAVING..." : "Save"
                )
            ]),

            m("div", { class : css.publishing },
                // Schedule
                m("button", {
                        // Attrs
                        class : css.schedule,
                        title : "Schedule a publish",

                        // Events
                        onclick : content.toggleSchedule.bind(content, null)
                    },
                    m("svg", { class : css.onlyIcon },
                        m("use", {
                            href : icons + "#schedule",
                            fill : state.dates.validSchedule ? "white" : "red"
                        })
                    )
                ),

                m("div", { class : css.publishContainer },
                    m("button", {
                            // Attrs
                            class    : css.publish,
                            title    : (state.meta.status === "published") ? "Already Published" : "",
                            disabled : locked || null,

                            // Events
                            onclick : schedule.publish.bind(schedule)
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

                m("button", {
                        // Attrs
                        class    : css.unpublish,
                        disabled : locked || null,

                        // Events
                        onclick : schedule.unpublish.bind(schedule)
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
