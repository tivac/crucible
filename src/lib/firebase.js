/* global crucible */
"use strict";

var Firebase = require("firebase");

module.exports = new Firebase(crucible.firebase);
module.exports.TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

module.exports.set = function(ref, value) {
    return new Promise(function(reject, resolve) {
        ref.set(value, function(error) {
            if(error) {
                return reject(error);
            }
            
            return resolve();
        });
    });
};

module.exports.remove = function(ref) {
    return new Promise(function(reject, resolve) {
        ref.remove(function(error) {
            if(error) {
                return reject(error);
            }
            
            return resolve();
        });
    });
};

module.exports.value = function(ref, type) {
    return new Promise(function(reject, resolve) {
        ref[type]("value", function(snap) {
            return resolve(snap);
        }, reject);
    });
};

// For debugging
global.firebase = module.exports;
