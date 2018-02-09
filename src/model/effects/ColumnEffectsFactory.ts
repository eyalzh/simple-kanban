import {Task} from "../Task";
import ColumnEffectIncrement from "./ColumnEffectIncrement";

export interface MatchPatternResult<T> {
    matched: boolean;
    config: T;
}

export interface ColumnEffect {
    modifyTask(task: Task, config: any): Task;
    matchPattern(str: string): MatchPatternResult<any>;
}

type EffectObjType = {[id: string]: new() => ColumnEffect};
const effectIdMapper: Readonly<EffectObjType> = Object.freeze({
    "increment": ColumnEffectIncrement,
});

export default class ColumnEffectsFactory {

    static getColumnEffectById(id: string): ColumnEffect | null {

        const cls = effectIdMapper[id];

        if (cls) {
            return new cls();
        } else {
            console.warn(`could not find effect with id "${id}"`);
        }

        return null;

    }

    static getEffectIdMapper(): Readonly<EffectObjType> {
        return effectIdMapper;
    }

}