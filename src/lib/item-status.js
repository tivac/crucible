import isFuture from "date-fns/is_future";
import isPast from "date-fns/is_past";

var STATUS = {
    UPDATED     : "updated",
    UNPUBLISHED : "unpublished",
    SCHEDULED   : "scheduled",
    LIVE        : "live"
};

export default function getItemStatus(itemData) {
    var result = "...";

    if(isPast(itemData.unpublished_at)) {
        result = STATUS.UNPUBLISHED;
    } else if(isFuture(itemData.published_at)) {
        result = STATUS.SCHEDULED;
    } else if(isPast(itemData.published_at)) {
        result = STATUS.LIVE;
    } else if(itemData.updated_at) {
        result = STATUS.UPDATED;
    }

    return result;
}

// export function getItemStyleClass(itemData) {

// }

