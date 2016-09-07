import m from "mithril";

// import sluggo from "sluggo";
// import get from "lodash.get";
// import merge from "lodash.merge";
// import assign from "lodash.assign";
// import capitalize from "lodash.capitalize";

import db from "../../lib/firebase.js";
// import update from "../../lib/update.js";
import watch from "../../lib/watch.js";
// import prefix from "../../lib/prefix.js";
// import name from "./name.js";

// import * as children from "../../types/children.js";
// import * as layout from "../layout/index.js";
// import * as nav from "./nav.js";
// import * as head from "./head.js";

import css from "./contents.css";


export function controller() {
    console.log("TEST");
};

export function view(ctrl) {
    return m("div",
            { class : css.tempDiv },
            "CONTENT LOREM IPSUM DOLOR SIT"
        );
};
