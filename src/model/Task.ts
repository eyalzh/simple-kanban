import {Timestamp} from "./Timestamp";

export interface TaskPresentationalOptions {
    color?: string;
}

export interface Counter {
    value: number;
}

export interface Task {

    // The auto generated ID of the task
    id: string;

    // The task's short description, which is the same as the task's title
    desc: string;

    // The task's long description, which is the same of the body of the task
    longdesc: string;

    // The time at which the task was created. If this is undefined, the time is unknown
    createdAt?: Timestamp;

    // The time at which the task was last updated. If this is undefined, the time is unknown
    lastUpdatedAt?: Timestamp;

    // Presentational options
    presentationalOptions?: TaskPresentationalOptions;

    // The column in which the task was originated
    baseColumnId?: string;

    counters?: Counter[];

}