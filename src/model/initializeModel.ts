import TaskModel from "./TaskModel";

export default function initializeModel(model: TaskModel): void {

    const boards = model.getBoards();

    if (boards.size === 0) {

        const board = model.addBoard("Default");
        model.setCurrentBoard(board);

        const columns = model.getColumns();

        if (columns.size === 0) {

            const backlog = model.addColumn("Backlog", 10);
            const next = model.addColumn("Next", 3);
            model.addColumn("Done", 10);

            model.addTask(next, "Create a new task by double clicking anywhere on this column");
            model.addTask(backlog, "Create a new column by pressing the 'Add Column' button at the upper right corner of the page");
            model.addTask(backlog, "Drag a task from this column to the next column");
            model.addTask(backlog, "Delete a task by dragging it to the 'Trash Zone'");
            model.addTask(backlog, "Edit a task by double clicking on it");
            model.addTask(backlog, "Use #hashtags in tasks' text");
            model.addTask(backlog, "Create a new board by pressing the 'Add Board' button at the upper right corner of the page");
            model.addTask(backlog, "Switch between boards by pressing Alt+B or using the select box at the upper right corner of the page");

        }

    }

}