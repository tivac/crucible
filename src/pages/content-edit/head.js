import m from "mithril";
import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

import config, { icons } from "../../config";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";
import * as scheduler from "./scheduler.js";

import css from "./head.css";

export function view(ctrl_unused, options) {
    var content = options.content,
        state = content.get(),
        publishTs = state.dates.published_at,
        unpublishTs = state.dates.unpublished_at,
        future  = isFuture(publishTs),
        locked  = config.locked;

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
                        href   : prefix("/listing/" + state.schema.name),
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
                        onclick : content.toggleSchedule
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
                            title    : future ? "Schedule publish" : "Already published",
                            disabled : locked || null,

                            // Events
                            onclick : content.publish.bind(content, options)
                        },
                        m("svg", { class : css.icon },
                            m("use", { href : icons + (future ? "#schedule" : "#publish") })
                        ),
                        future ? "Schedule" : "Publish"
                    ),
                    !state.form ?
                        null :
                        m.component(invalidMsg, { content : content }) 
                ),

                // Unpublish
                (state.meta.status === "draft") ?
                null :
                m("button", {
                        // Attrs
                        class    : css.unpublish,
                        title    : isPast(unpublishTs) ? "Already unpublished" : "Unpublish immediately",
                        disabled : locked || null,

                        // Events
                        onclick : content.unpublish.bind(content, options)
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
                m.component(scheduler, options)
        )
    );
}
