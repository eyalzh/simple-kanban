import TaskModel, {FLAGS} from "./TaskModel";

export default async function initializeModel(model: TaskModel) {

    const boards = await model.getBoards();
    const wasTutorialAdded = await model.getFlag(FLAGS.TUTORIAL_ADDED);

    if (!wasTutorialAdded && boards.length === 0) {

        console.log("tutorial flag not found, adding tutorial data...");

        const board = await model.addBoard("Tutorial");
        await model.setCurrentBoard(board);
        const columns = await model.getColumns();

        if (columns.length === 0) {

            const backlog = await model.addColumn("Backlog", 10);
            const next = await model.addColumn("Next", 3);
            await model.addColumn("Done", 10);

            await model.addTask(next, "Create a new task by double clicking anywhere on this column");
            await model.addTask(backlog, "Create a new column by pressing the 'Add Column' button at the upper right corner of the page");
            await model.addTask(backlog, "Drag this task from this column to the next column");
            await model.addTask(backlog, "Delete this task by dragging it to the 'Trash Zone'");
            await model.addTask(backlog, "Edit this task by double clicking on it");
            await model.addTask(backlog, "Use #hashtags in tasks' text");
            await model.addTask(backlog, "Create a new board by pressing the 'Add Board' button at the upper right corner of the page");
            await model.addTask(backlog, "Switch between boards by pressing Alt+B or using the select box at the upper right corner of the page");

        }

        await model.setFlagOn(FLAGS.TUTORIAL_ADDED);

    }

}