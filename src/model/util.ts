import {DB} from "./DB/DB";

export enum Direction {UP = -1, DOWN = 1}
export function reorderArray<T>(arr: Array<T>, searchFn: (T) => boolean, direction: Direction): Array<T> {

    const ret = arr.slice(0); // clone the array
    const idx = arr.findIndex(searchFn);

    if (typeof idx === "undefined") {
        throw new Error(`Cannot find the element in the array`);
    }

    const temp = arr[idx];
    const offset = direction;
    const targetIdx = idx + offset;

    if (targetIdx < arr.length && targetIdx >= 0) {
        ret[idx] = ret[targetIdx];
        ret[targetIdx] = temp;
    }

    return ret;

}

/**
 * Generate a globally unique ID
 */
var uniqueId: number|null = null;
export async function generateUniqId(db: DB, prefix: string): Promise<string> {

    if (uniqueId === null) {
        uniqueId = Number(await db.getItem("uniqueId"));
        if (! uniqueId) {
            uniqueId = 1;
        }
    }
    uniqueId++;
    await db.setItem("uniqueId", uniqueId.toString());

    return prefix + "_" + uniqueId;
}