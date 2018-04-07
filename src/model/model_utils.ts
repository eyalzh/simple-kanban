import {DB} from "./DB/DB";
import {Timestamp} from "./Timestamp";

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
