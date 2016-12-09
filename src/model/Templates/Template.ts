import TaskModel from "../TaskModel";

export interface Template {

    getName(): string;
    applyOnModel(model: TaskModel): Promise<void>;

}