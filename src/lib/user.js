import { app } from "./firebase.js";

var _user;

app.auth().onAuthStateChanged(
    function(data) {
        _user = data;
    },
    function() {
        _user = null;
    }
);

export function user() {
    return _user;
}

export function wait() {
    if(_user) {
        return Promise.resolve(_user);
    }

    return new Promise(function(resolve, reject) {
        var unsub = app.auth().onAuthStateChanged(
            function(data) {
                unsub();

                resolve(data);
            },
            function() {
                unsub();

                reject();
            }
        );
    });
}
