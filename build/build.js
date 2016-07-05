"use strict";

var rollup = require("rollup").rollup,

    config = require("./lib/rollup")();

require("./lib/files").dir();
require("./lib/files").copy();

rollup(config).then(function(bundle) {
    return bundle.write(config);
})
.catch(function(error) {
    console.error(error.stack);
});
