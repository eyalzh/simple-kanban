import {ColumnEffect, MatchPatternResult} from "./ColumnEffectsFactory";
import {Task} from "../Task";

interface Configuration {
    op: 1 | -1;
    delta: number;
}

export default class ColumnEffectIncrement implements ColumnEffect {

    modifyTask(task: Task, config: Configuration): Task {

        if (! task.counters) {
            return task;
        }

        const counters = [...task.counters];
        counters.forEach(counter => counter.value += config.op * config.delta);
        const newTask = {...task, counters};
        return newTask;
    }

    matchPattern(str: string): MatchPatternResult<Configuration | null> {
        const matchedValues: RegExpExecArray | null = /\W([+-])(\d+)/g.exec(str);

        if (matchedValues) {
            return {
                matched: true,
                config: {
                    op: matchedValues[1] === "+" ? 1 : -1,
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

}