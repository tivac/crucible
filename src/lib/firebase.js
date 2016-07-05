import firebase from "firebase";
import config from "../config";

var ref;

firebase.initializeApp(config.firebase);

ref = firebase.database().ref();

ref.TIMESTAMP = firebase.database.ServerValue.TIMESTAMP;

// For debugging
window.db = ref;

export default ref;
