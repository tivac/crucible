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
        
        require("fs").writeFileSync("../_output.js", result.code);
        
        vm.runInThisContext(`(function(module, exports) { ${result.code} })`, {
            filename : entry
        })(tgt, tgt.exports);
        
        return tgt;
    });
};
