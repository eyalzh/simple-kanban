import {DB} from "./DB/DB";
import {Timestamp} from "./Timestamp";

export function reorderArray<T>(arr: Array<T>, sourceIndex: number, targetIndex: number): Array<T> {

    const ret = arr.slice(0); // clone the array

    ret.splice(sourceIndex, 1);
    ret.splice(targetIndex, 0, arr[sourceIndex]);

    return ret;
}

/**
 * Generate a globally unique ID
 */
let uniqueId: number | null = null;
export async function generateUniqId(db: DB, prefix: string): Promise<string> {

    if (uniqueId === null) {
        try {
            const uniqueIdVal = await db.getItem<string>("uniqueId");
            if (uniqueIdVal === null) {
                uniqueId = 1;
            } else {
                uniqueId = Number(uniqueIdVal);
            }
        } catch (e) {
            uniqueId = 1;
        }
    }
    uniqueId++;
    await db.setItem("uniqueId", uniqueId.toString());

    return prefix + "_" + uniqueId;
}

export function getCurrentTime(): Timestamp {

    const now: Timestamp = {
        value: Date.now()
    };

    return now;
}