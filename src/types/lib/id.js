export default function(options) {
    return options.path.length ? options.path.join("-") : options.details.key;
}
