import {Template} from "./Template";
import TaskModel from "../TaskModel";

export default class ProjectTemplate implements Template {

    public getName(): string {
        return "Project";
    }

    public async applyOnModel(model: TaskModel) {

        await model.addColumn("Backlog", 16);
        await model.addColumn("Next", 4);
        await model.addColumn("Doing", 2);
        await model.addColumn("Done", 99);

    }

}
