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
    lastSteamReleased?: Timestamp;

    // Presentational options
    presentationalOptions?: TaskPresentationalOptions;

    // The column in which the task was originated
    baseColumnId?: string;

    // Set of counters associated with the task
    counters?: Counter[];

    // An optional link to board associated with the task
    linkToBoardId?: string;

    // Steam is accumulated as time goes by and is fully released
    // when the task is moved from its column. Each task can have a different volume of steam that it can carry
    // before an indication appears
    steamVol?: number;

}

export enum TaskSteamStatus {
    UNKNOWN = -1,
    EMPTY = 0,
    HALF_FULL = 0.5,
    ALMOST_FULL = 0.9,
    FULL = 1
}

export function getTaskSteamStatus(task: Task): TaskSteamStatus | undefined {

    if (! task.lastSteamReleased || ! task.steamVol) {
        return TaskSteamStatus.UNKNOWN;
    }

    const now = new Date().getTime();
    const hourMs = 3_600_000;
    const hoursSinceLastUpdated = (now - task.lastSteamReleased.value ) / hourMs;
    const steam = (hoursSinceLastUpdated / task.steamVol);

    return [TaskSteamStatus.FULL, TaskSteamStatus.ALMOST_FULL, TaskSteamStatus.HALF_FULL, TaskSteamStatus.EMPTY]
        .find(status => steam >= status);

}
