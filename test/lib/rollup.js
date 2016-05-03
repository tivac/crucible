var vm = require("vm"),

    rollup = require("rollup").rollup;

module.exports = function(entry, tgt) {
    return rollup(
        Object.assign(
            {},
            require("../../build/_rollup"),
            { entry : entry }
        )
    )
    .then((bundle) => {
        var result = bundle.generate({ format : "cjs" });
        
        vm.runInThisContext(`(function(exports) { ${result.code} })`)(tgt);
    });
};
