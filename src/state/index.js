"use strict";

var redux = require("redux"),
    
    store;
    
store = redux.createStore(redux.combineReducers({
    ui : require("./ui-reducer")
}));

module.exports = store;
