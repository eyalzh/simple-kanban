import * as React from "react";
import {Task} from "../../model/Task";

export interface TextPartComponentProps {
    task: Task;
    text: string;
}

export interface TaskTitlePart {
    component: (props: TextPartComponentProps) => JSX.Element;
    text: string;
}

export const RegularText = ({text}) => text;

export const CounterText = ({task}) => {

    const counters = task.counters;
    let counterValue: number | null = null;
    if (counters && counters.length > 0) {
        counterValue = counters[0].value;
    }
    return (<i>({counterValue})</i>);
};

export const TagText = ({text}) => {
    return (
        <span className="hashtag">{text}</span>
    );
};

export function parseTaskTitle(taskTitle: string): TaskTitlePart[] {

    return taskTitle
        .split(/(#\S+)/g)
        .filter(text => text.length > 0)
        .map((text) => {
            if (text === "#1") {
                return {
                    component: CounterText,
                    text
                };
            } else if (text.charAt(0) === "#") {
                return {
                    component: TagText,
                    text
                };
            } else {
                return {
                    component: RegularText,
                    text
                };
            }
    });
}
