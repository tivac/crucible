var vm = require("vm"),

    rollup = require("rollup").rollup;

module.exports = function(entry, tgt) {
    tgt.exports = {};
    
    return rollup(
        Object.assign(
            {},
            require("../../build/_rollup"),
            { entry : entry }
        )
    )
    .then((bundle) => {
        var result = bundle.generate({ format : "cjs" });
        
        require("fs").writeFileSync(`./output-${require("path").basename(entry)}`, result.code);
        
        vm.runInThisContext(`(function(module, exports) { ${result.code} })`)(tgt, tgt.exports);
    });
};
