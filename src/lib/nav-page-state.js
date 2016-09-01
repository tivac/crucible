import clamp from "lodash.clamp";

var PageState = function() {    
    var MIN_PAGE = 1;

    this.page     = 1;
    this.itemsPer = 4;

    this.limits = [
        NaN, // Pad with a NaN so our indexes match page number
        Number.MAX_SAFE_INTEGER
    ];

    this.numPages = function() {
        return this.limits.length - 1;
    };

    this.currPageTs = function() {
        return this.limits[this.page];
    };
    this.nextPageTs = function() {
        var nextIndex = this.page + 1;

        return this.limits.length > nextIndex && this.limits[nextIndex];
    };

    this.next = function() {
        this.page = this.clampPage(++this.page);
    };
    this.prev = function() {
        this.page = this.clampPage(--this.page);
    };
    this.clampPage = function(pgNum) {
        return clamp(pgNum, MIN_PAGE, this.numPages());
    };
};

export default PageState;
