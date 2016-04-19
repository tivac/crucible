import Firebase from "firebase";
import config from "../config";

var firebase = new Firebase(config.firebase);

export default firebase;
export let TIMESTAMP = Firebase.ServerValue.TIMESTAMP;

// For debugging
global.firebase = firebase;
