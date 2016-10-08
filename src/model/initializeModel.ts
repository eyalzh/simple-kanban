import TaskModel from "./TaskModel";

export default async function initializeModel(model: TaskModel) {

    const boards = await model.getBoards();

    if (boards.size === 0) {

        const board = await model.addBoard("Default");
        await model.setCurrentBoard(board);

        const columns = await model.getColumns();

        if (columns.size === 0) {

            const backlog = await model.addColumn("Backlog", 10);
            const next = await model.addColumn("Next", 3);
            await model.addColumn("Done", 10);

            await Promise.all([
                model.addTask(next, "Create a new task by double clicking anywhere on this column"),
                model.addTask(backlog, "Create a new column by pressing the 'Add Column' button at the upper right corner of the page"),
                model.addTask(backlog, "Drag a task from this column to the next column"),
                model.addTask(backlog, "Delete a task by dragging it to the 'Trash Zone'"),
                model.addTask(backlog, "Edit a task by double clicking on it"),
                model.addTask(backlog, "Use #hashtags in tasks' text"),
                model.addTask(backlog, "Create a new board by pressing the 'Add Board' button at the upper right corner of the page"),
                model.addTask(backlog, "Switch between boards by pressing Alt+B or using the select box at the upper right corner of the page")
            ]);

        }

    }

}