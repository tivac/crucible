"use strict";

var fetch = window.fetch,
    
    m = require("mithril"),
    
    db = require("../lib/firebase"),
    
    layout = require("./layout");

module.exports = {
    controller : function() {
        var ctrl = this,
            auth = db.getAuth();

        ctrl.schemas = [];

        fetch(db.child("schemas").toString() + ".json?shallow=true&auth=" + auth.token)
            .then(function(response) {
                return response.json();
            })
            .then(function(schemas) {
                ctrl.schemas = Object.keys(schemas);

                return Promise.all(
                    ctrl.schemas.map(function(schema) {
                        return Promise.all([
                            new Promise(resolve, reject) {
                                db.child("content/" + schema).orderByChild("")
                            }
                        ]);
                    })
                );
            })
            .then(function() {
                console.log(arguments); // TODO: REMOVE DEBUGGING
            })
            .catch(console.error.bind(console));
    },

    view : function() {
        return m.component(layout, {
            title   : "Home",
            content : m("ul",
                m("li",
                    m("a", { href : "/schemas", config : m.route }, "Schemas")
                ),
                m("li",
                    m("a", { href : "/content", config : m.route }, "Content")
                )
            )
        });
    }
};
