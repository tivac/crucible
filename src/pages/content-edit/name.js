"use strict";

export default function name(schema, data) {
    return data.name || (schema.name && "Untitled " + schema.name) || "...";
}
