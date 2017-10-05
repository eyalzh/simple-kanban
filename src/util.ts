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

const cache = {};
export function calcColorBasedOnBackground(color: string): string {

    if (typeof color === "undefined") {
        return "#000";
    }

    if (cache[color]) return cache[color];

    if (color.length !== 7) {
        throw new Error("expected a 7 character string");
    }

    let response;

    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);

    const luminance = 1 - ( 0.299 * r + 0.587 * g + 0.114 * b) / 255;

    if (luminance < 0.5)
        response = "#000"; // bright colors - black font
    else
        response = "#fff"; // dark colors - white font

    cache[color] = response;

    return response;

}

export function bind(target, key) {
    if (typeof target.__bindlist === "undefined") {
        target.__bindlist = [];
    }
    target.__bindlist.push(key);
}

export function allowBinds<T extends {new(...args: any[]): {}}>(constructor: T) {

    const target = constructor;

    return class extends constructor {
        constructor(...args) {
            super(...args);
            (this["__bindlist"] || []).forEach(key => {
                Object.defineProperty(this, key, {value: target.prototype[key].bind(this)});
            });
        }
    };
}
