"use strict";

module.exports = function(s) {
    return (s && s.length) ? s.charAt(0).toUpperCase() + s.slice(1) : null;
};
