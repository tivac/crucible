"use strict";

export default function name(schema, data) {
    return data.name || "Untitled " + schema.name;
}
