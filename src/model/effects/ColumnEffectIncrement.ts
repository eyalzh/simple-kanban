import {ColumnEffect, MatchPatternResult} from "./ColumnEffectsFactory";
import {Task} from "../Task";

interface Configuration {
    op: 1 | -1 | 0;
    delta: number;
}

export default class ColumnEffectIncrement implements ColumnEffect {

    static signMap = {
        "+": 1,
        "-": -1,
        "=": 0
    };

    modifyTask(task: Task, config: Configuration): Task {

        if (! task.counters) {
            return task;
        }

        const counters = [...task.counters];
        counters.forEach(counter => {
            if (config.op === 0) {
                counter.value = config.delta;
            } else {
                counter.value += config.op * config.delta;
            }
        });
        const newTask = {...task, counters};
        return newTask;
    }

    matchPattern(str: string): MatchPatternResult<Configuration | null> {
        const matchedValues: RegExpExecArray | null = /([+-=])(\d+)/g.exec(str);

        if (matchedValues) {
            return {
                matched: true,
                config: {
                    op: ColumnEffectIncrement.getOpFromSign(matchedValues[1]),
                    delta: parseInt(matchedValues[2], 10)
                }
            };
        } else {
            return {
                matched: false,
                config: null
            };
        }

    }

    static getOpFromSign(sign: string) {
        return ColumnEffectIncrement.signMap[sign] || 0;
    }

}