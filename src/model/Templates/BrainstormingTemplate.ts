import {Template} from "./Template";
import TaskModel from "../TaskModel";

export default class BrainstormingTemplate implements Template {

    public getName(): string {
        return "Brainstorming";
    }

    public async applyOnModel(model: TaskModel) {

        await model.addColumn("Rejected", 99);
        await model.addColumn("Ideas", 12);
        await model.addColumn("To Elaborate", 12);
        await model.addColumn("To Validate", 2);
        await model.addColumn("Winners", 2);

    }

}
