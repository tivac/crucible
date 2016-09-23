"use strict";

export default function name(schema, state) {
    return state.meta.name || "Untitled " + schema.name;
}
