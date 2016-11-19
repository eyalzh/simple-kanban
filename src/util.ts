export function classSet(classNames: Object) {
    let names = "";

    for (let name in classNames) {
        if (!classNames.hasOwnProperty(name) || !classNames[name]) {
            continue;
        }
        names += name + " ";
    }

    return names.trim();
}