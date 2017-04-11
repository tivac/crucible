import m from "mithril";

import config from "../../config";
import prefix from "../../lib/prefix";

import * as invalidMsg from "./invalid-msg.js";
import * as scheduleBox from "./schedule-box.js";

import arrowIcon from "../../icons/arrow.svg";
import saveIcon from "../../icons/save.svg";
import publishIcon from "../../icons/publish.svg";
import scheduleIcon from "../../icons/schedule.svg";
import removeIcon from "../../icons/remove.svg";

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
                    m.trust(arrowIcon),
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
                    m.trust(saveIcon),
                    state.ui.saving ? "SAVING..." : "Save"
                )
            ]),

            m("div", { class : css.publishing },
                // Schedule
                m("button", {
                        // Attrs
                        class : state.dates.validSchedule ? css.schedule : css.scheduleInvalid,
                        title : "Schedule a publish",

                        // Events
                        onclick : content.toggleSchedule.bind(content, null)
                    },
                    m.trust(scheduleIcon)
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
                        m.trust(publishIcon),
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
                    m.trust(removeIcon),
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
