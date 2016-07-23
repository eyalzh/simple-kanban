import TaskModel from "./model/TaskModel";

let model;

export function setModel(m: TaskModel) {
    model = m;
}

export function getModel(): TaskModel {
    return model;
}
