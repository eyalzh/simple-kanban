import {Template} from "./Template";
import TaskModel from "../TaskModel";

export default class TutorialTemplate implements Template {

    public getName(): string {
        return "Tutorial";
    }

    public async applyOnModel(model: TaskModel): Promise<void> {

        const backlog = await model.addColumn("Backlog", 10);
        const next = await model.addColumn("Next", 3);
        await model.addColumn("Done", 10);

        await model.addTask(next, "Create a new task by double clicking anywhere on this column");
        await model.addTask(backlog, "Create a new column by selecting 'Add column' in the menu at the upper right corner of the page");
        await model.addTask(backlog, "Drag this task from this column to the next column");
        await model.addTask(backlog, "Delete this task by dragging it to the 'Trash Zone'");
        await model.addTask(backlog, "Edit this task by double clicking on it",
            "You may add a detailed description here");
        await model.addTask(backlog, "Use #hashtags in tasks' text");
        await model.addTask(backlog, "Create a new board by selecting 'Add new board' in the menu");
        await model.addTask(backlog, "Switch between boards by using the select box at the upper left corner of the page");

    }

}
