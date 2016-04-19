/* global Promise, fetch */
"use strict";

var m        = require("mithril"),
    filter   = require("lodash.filter"),
    each     = require("lodash.foreach"),
    parallel = require("run-parallel"),
    join     = require("url-join"),
    url      = require("url"),
    path     = require("path"),
    
    config = require("../config"),
    
    id    = require("./lib/id"),
    hide  = require("./lib/hide"),
    label = require("./lib/label"),
    
    css = require("./upload.css"),
    
    icons = config.icons;

// Load fetch polyfill
require("whatwg-fetch");

function status(response) {
    // Assume opaque responses are cool, because who knows?
    return response.type === "opaque" || (response.status >= 200 && response.status < 300);
}

// Helper
function checkStatus(response) {
    var error;
    
    if(status(response)) {
        return response;
    }
    
    error = new Error(response.statusText);
    error.response = response;
    
    throw error;
}

function name(remote) {
    return path.basename(url.parse(remote).path);
}

module.exports = {
exports.controller = function(options) {
    var ctrl = this;
    
    if(!options.field.ws) {
        console.error("No ws for upload field");
        // throw new Error("Must define a ws for upload fields");
    }
    
    ctrl.id = id(options);
    
    // Drag-n-drop state tracking
    ctrl.dragging  = false;
    ctrl.uploading = false;
    
    if(options.data) {
        if(typeof options.data === "string") {
            options.data = [ options.data ];
        }
        
        ctrl.files = options.data.map(function(remote) {
            return {
                name     : name(remote),
                uploaded : true,
                remote   : remote
            };
        });
    } else {
        ctrl.files = [];
    }
            
    // Event handlers
    ctrl.remove = function(idx, e) {
        e.preventDefault();
        
        ctrl.files.splice(idx, 1);
        
        ctrl._update();
    };
    
    ctrl.dragon = function(e) {
        e.preventDefault();

        if(ctrl.dragging) {
            m.redraw.strategy("none");
            return;
        }
        
        // Don't show this as a drag target if there's already something there
        // and it's not a multiple field
        if(ctrl.files.length && !options.field.multiple) {
            m.redraw.strategy("none");
            return;
        }
        
        ctrl.dragging = true;
    };

    ctrl.dragoff = function() {
        ctrl.dragging = false;
    };

    ctrl.drop = function(e) {
        var dropped;
        
        ctrl.dragoff();
        e.preventDefault();
        
        // Must delete existing file before dragging on more
        if(ctrl.files.length && !options.field.multiple) {
            return;
        }
        
        // Filter out non-images
        dropped = filter((e.dataTransfer || e.target).files, function(file) {
            return file.type.indexOf("image/") === 0;
        });
        
        if(options.field.multiple) {
            ctrl.files = ctrl.files.concat(dropped);
        } else {
            ctrl.files = dropped.slice(-1);
        }
        
        // Load all the images in parallel so we can show previews
        parallel(
            ctrl.files
            .filter(function(file) {
                return !file.uploaded;
            })
            .map(function(file) {
                return function(callback) {
                    var reader = new FileReader();

                    reader.onload = function(result) {
                        file.src = result.target.result;
                        
                        callback();
                    };

                    reader.readAsDataURL(file);
                };
            }),
            
            function(err) {
                if(err) {
                    return console.error(err);
                }
                
                m.redraw();
                
                return ctrl._upload();
            }
        );
    };
    
    // Update w/ the result, but removing anything that hasn't been uploaded
    ctrl._update = function() {
        var files = ctrl.files.filter(function(file) {
                return file.uploaded && file.remote;
            }).map(function(file) {
                return file.remote;
            });
        
        options.update(
            options.path,
            options.field.multiple ? files : files[0]
        );
    };
    
    // Upload any files that haven't been uploaded yet
    ctrl._upload = function() {
        var files = files = ctrl.files.filter(function(file) {
                return !file.uploaded && !file.uploading;
            });
        
        if(!files.length) {
            return;
        }
        
        fetch(options.field.ws)
        .then(checkStatus)
        .then(function(response) {
            return response.json();
        })
        .then(function(config) {
            files.forEach(function(file) {
                file.uploading = true;
            });
            
            // queue a redraw here so we can show uploading status
            m.redraw();
            
            return Promise.all(
                files.map(function(file) {
                    var data = new FormData();
                    
                    each(config.fields, function(val, key) {
                        data.append(key, val);
                    });
                    
                    data.append("Content-Type", file.type);
                    
                    each(options.field.headers || {}, function(value, key) {
                        data.append(key, value);
                    });
                    
                    data.append(config.filefield, file);
                    
                    return fetch(config.action, {
                        method : "post",
                        body   : data,
                        mode   : "cors"
                    })
                    .then(function(response) {
                        if(status(response)) {
                            file.uploaded  = true;
                            file.uploading = false;
                            file.remote    = join(config.actexports.on, config.fields.key.replace("${filename}", file.name));
                        }
                        
                        // queue a redraw as each file completes/fails
                        m.redraw();
                        
                        return file;
                    });
                })
            );
        })
        .then(ctrl._update)
        .catch(function(error) {
            // TODO: error-handling
            console.error(error);
        });
    };
},

exports.view = function(ctrl, options) {
    var field  = options.field,
        hidden = hide(options);
    
    if(hidden) {
        return hidden;
    }

    return m("div", { class : options.class },
        label(ctrl, options),
        m("div", {
                // Attrs
                class : css[ctrl.dragging ? "highlight" : "target"],
                
                // Events
                ondragover  : ctrl.dragon,
                ondragleave : ctrl.dragoff,
                ondragend   : ctrl.dragoff,
                ondrop      : ctrl.drop
            },
            ctrl.files.length ?
                m("ul", { class : css.queue },
                    ctrl.files.map(function(file, idx) {
                        return m("li", { class : css.queued },
                            m("div", { class : css.image },
                                m("img", {
                                    class : css.img,
                                    src   : file.remote || file.src
                                })
                            ),
                            m("div", { class : css.meta },
                                m("p", { class : css.name }, file.name),
                                file.uploading ?
                                    m("p", "UPLOADING") :
                                    null,
                                file.uploaded ?
                                    m("input", {
                                        value   : file.remote,
                                        onclick : function(e) {
                                            e.target.select();
                                        }
                                    }) :
                                    null
                            ),
                            m("div", { class : css.actions },
                                m("button", {
                                        // Attrs
                                        class : css.remove,
                                        title : "Remove",
                                        
                                        // Events
                                        onclick : ctrl.remove.bind(ctrl, idx)
                                    },
                                    m("svg", { class : css.icon },
                                        m("use", { href : icons + "#remove" })
                                    )
                                )
                            )
                        );
                    })
                ) :
                    
                m("p", { class : css.instructions }, field.multiple ?
                    "Drop files here to upload" :
                    "Drop a file here to upload"
                )
        )
    );
};
