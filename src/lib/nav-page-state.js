import clamp from "lodash.clamp";

var MIN_PAGE = 1,
    DEFAULT_ITEMS_PER = 10,
    INITIAL_LIMITS = [
        NaN, // Pad with a NaN so our indexes match page number
        Number.MAX_SAFE_INTEGER
    ];

// eslint-disable-next-line one-var, func-style
var PageState = function(itemsPer) {
    this.itemsPer = itemsPer || DEFAULT_ITEMS_PER;
    this.limits = INITIAL_LIMITS.slice(); // copy

    this.page = 1;
};

PageState.prototype = {
    changeItemsPer : function(newNum) {
        this.itemsPer = newNum;
        this.reset();
    },

    reset : function() {
        this.limits = INITIAL_LIMITS.slice(); // copy
        this.page = 1;
    },

    numPages : function() {
        return this.limits.length - 1;
    },

    currPageTs : function() {
        return this.limits[this.page];
    },

    nextPageTs : function() {
        var nextIndex = this.page + 1;

        return this.limits.length > nextIndex ? this.limits[nextIndex] : null;
    },

    first : function() {
        this.page = MIN_PAGE;
    },

    next : function() {
        this.page = this.clampPage(++this.page);
    },

    prev : function() {
        this.page = this.clampPage(--this.page);
    },

    clampPage : function(pgNum) {
        return clamp(pgNum, MIN_PAGE, this.numPages());
    }
};

export default PageState;
