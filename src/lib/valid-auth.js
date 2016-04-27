import db from "./firebase";

export default function() {
    var auth = db.getAuth();
    
    return auth && ((auth.expires * 1000) > Date.now());
}
