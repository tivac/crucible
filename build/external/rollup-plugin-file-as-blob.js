'use strict';

// COPIED FROM https://www.npmjs.com/package/rollup-plugin-file-as-blob
// BUT REMOVED THE NATIVE DEPENDENCY BECAUSE EUGH

var fs = require('fs');
var rollupPluginutils = require('rollup-pluginutils');
var mime = require("mime-types");

function fileAsBlob ( options ) {
	if ( options === void 0 ) options = {};

	var filter = rollupPluginutils.createFilter( options.include, options.exclude );

	return {
		name: 'file-as-blob',

		intro: function () {
			return "function __$strToBlobUri(str, mime, isBinary) {\n\t\t\t\ttry {\n\t\t\t\t\treturn window.URL.createObjectURL(\n\t\t\t\t\t\tnew Blob([Uint8Array.from(\n\t\t\t\t\t\t\tstr.split('').map(function(c) {return c.charCodeAt(0)})\n\t\t\t\t\t\t)], {type: mime})\n\t\t\t\t\t);\n\t\t\t\t} catch (e) {\n\t\t\t\t\treturn \"data:\" + mime + (isBinary ? \";base64,\" : \",\") + str;\n\t\t\t\t}\n\t\t\t}".split('\n').map(Function.prototype.call, String.prototype.trim).join('');
		},

		load: function load ( id ) {
			if ( !filter( id ) ) { return null; }

			id = fs.realpathSync(id);

			return new Promise(function (res){
                var type = mime.contentType(id);

                var charset = type.split('; charset=')[1];

                var readEncoding = 'base64';
                if (charset === 'utf-8') { readEncoding = 'utf8'; }
                if (charset.indexOf('ascii') !== -1) { readEncoding = 'ascii'; }

                var data = fs.readFileSync( id, readEncoding );

                var code;
                if (readEncoding === 'base64') {
                    code = "export default __$strToBlobUri(atob(\"" + data + "\"), \"" + type + "\", true);";
                } else {
                    // Unfortunately buble+rollup will create code that chokes
                    // with newlines/quotes when the contents are read from
                    // a file
                    data = data.replace(/\n/g, '\\n')
                                .replace(/\r/g, '\\r')
                                .replace(/"/g, '\\"')
                                .replace(/sourceMappingURL/g, 'sourceMap" + "pingURL');
                    code = "export default __$strToBlobUri(\"" + data + "\", \"" + type + "\", false);";
                }

                return res({ code: code, map: { mappings: '' } });
			});
		}
	};
}

module.exports = fileAsBlob;
