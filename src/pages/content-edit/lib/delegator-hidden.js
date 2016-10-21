export default function Hidden(content) {
    this.content = content;
}

Hidden.prototype = {
    // Hidden / Dependent fields.
    getHiddenIndex : function(key) {
        return this.content.get().form.hidden.indexOf(key);
    },

    register : function(key, isHidden) {
        if(isHidden) {
            this.add(key);
        } else {
            this.remove(key);
        }
    },

    add : function(key) {
        var state = this.content.get(),
            index = this.getHiddenIndex(key);

        if(index === -1) { 
            state.form.hidden.push(key);
        }
    },

    remove : function(key) {
        var state = this.content.get(),
            index = this.getHiddenIndex(key);

        if(index > -1) {
            state.form.hidden.splice(index, 1);
        }
    }
};
