var vm = require("vm"),

    rollup = require("rollup").rollup;

module.exports = function(entry, tgt) {
    tgt.exports = {};
    
    return rollup(
        Object.assign(
            {},
            require("../../build/lib/rollup")(),
            { entry : entry }
        )
    )
    .then((bundle) => {
        var result = bundle.generate({ format : "cjs" });
        
        vm.runInThisContext(`(function(module, exports) { ${result.code} })`)(tgt, tgt.exports);
    });
};
