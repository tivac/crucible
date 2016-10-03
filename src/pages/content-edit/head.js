import m from "mithril";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

import config, { icons } from "../../config";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";
import * as scheduleBox from "./schedule-box.js";

import css from "./head.css";

export function view(ctrl_unused, options) {
    var content = options.content,
        schedule = content.schedule,
        state = content.get(),

        pub = state.dates.published_at,
        unpub = state.dates.unpublished_at,

        future  = pub && isFuture(pub),
        locked  = config.locked,

        disablePub = (state.meta.status === "published"),
        disableUnpub = (state.meta.status === "draft" || (!pub && !unpub));


    // TODO Better implementation.
    // if(ctrl.start.ts && isPast(ctrl.start.ts)) {
    //     isDisabled = true;
    // }
    // TODO Better implementation.
    // if(ctrl.end.ts && isPast(ctrl.end.ts)) {
    //     isDisabled = true;
    // }

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
                        disabled : locked || null,

                        // Events
                        onclick : state.ui.saving ? null : content.save.bind(null, state)
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
                            title    : disablePub ? "Already Published" : "",
                            disabled : locked || disablePub || null,

                            // Events
                            onclick : schedule.publish.bind(schedule, options)
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
                        disabled : locked || disableUnpub || null,

                        // Events
                        onclick : schedule.unpublish.bind(schedule, options)
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
