
export default function Hidden(content) {
    var h = this,
        content = content;

    // Hidden / Dependent fields.
    function getHiddenIndex(key) {
        var state = content.get();

        return state.form.hidden.indexOf(key);
    }

    h.register = function(key, isHidden) {
        if(isHidden) {
            h.add(key);
        } else {
            h.remove(key);
        }
    };

    h.add = function(key) {
        var state = content.get(),
            index = getHiddenIndex(key);

        if(index === -1) { 
            state.form.hidden.push(key);
        }
    };

    h.remove = function(key) {
        var state = content.get(),
            index = getHiddenIndex(key);

        if(index > -1) {
            state.form.hidden.splice(index, 1);
        }
    };
}
