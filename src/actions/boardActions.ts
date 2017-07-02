import {Column} from "../model/column";
import dispatcher from "../Dispatcher";
import {getModel} from "../context";
import NonEmptyColumnException from "../model/NonEmptyColumnException";
import {BoardStore} from "../stores/BoardStore";
import {Task} from "../model/Task";
import {Board} from "../model/Board";
import {Template} from "../model/Templates/Template";

export function addColumn(columnName: string, wipLimit: number) {
    getModel()
        .addColumn(columnName, wipLimit)
        .then(this.dispatchRefreshBoard);
}

export function addTask(column: Column, taskDesc: string, taskLongDesc?: string) {
    getModel()
        .addTask(column.id, taskDesc, taskLongDesc)
        .then(this.dispatchRefreshBoard);
}

export function deleteTask(columnId: string, taskId: string) {
    getModel()
        .deleteTask(columnId, taskId)
        .then(this.dispatchRefreshBoard);
}

export function clear() {
    getModel()
        .clear()
        .then(() => {
            document.location.reload(true);
        });
}

export function switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {
    getModel()
        .switchColumns(boardId, firstColumnId, secondColumnId)
        .then(this.dispatchRefreshBoard);
}

export function editTask(taskId: string, newDesc: string, newLongDesc?: string) {
    getModel()
        .editTask(taskId, newDesc, newLongDesc)
        .then(this.dispatchRefreshBoard);
}

export function moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {
    getModel()
        .moveTask(taskId, sourceColumnId, targetColumnId)
        .then(this.dispatchRefreshBoard);
}

export function removeColumn(boardId: string, columnId: string) {

    getModel()
        .removeColumn(boardId, columnId)
        .then(this.dispatchRefreshBoard)
        .catch(e => {
            if (e instanceof NonEmptyColumnException) {
                alert("Cannot remove a column that has tasks");
            } else {
                console.error(e);
                alert("Cannot remove column (see dev console)");
            }
        });
}

export function editColumn(column: Column, newName: string, newWip: number) {
    getModel()
        .editColumn(column.id, newName, newWip)
        .then(this.dispatchRefreshBoard);
}

export function switchBoard(boardId: string) {
    getModel()
        .setCurrentBoard(boardId)
        .then(this.dispatchRefreshBoard);
}

export function addBoard(boardName: string, template: Template | undefined) {

    getModel()
        .addBoard(boardName)
        .then((boardId) => {
            return getModel().setCurrentBoard(boardId);
        })
        .then(() => {
            if (template) {
                return template.applyOnModel(getModel());
            }
        })
        .then(this.dispatchRefreshBoard);

}

export function editCurrentBoard(boardName: string) {
    getModel()
        .editCurrentBoard(boardName)
        .then(this.dispatchRefreshBoard);
}

export function removeCurrentBoard() {

    (async function () {

        const currentBoard = await getModel().getCurrentBoard();
        if (currentBoard !== null) {
            const tasks = await getModel().getTasksByBoard(currentBoard);

            if (tasks.length > 0) {
                alert(`Cannot remove a non-empty board (${tasks.length} tasks found)`);
            } else {
                const nextBoard = await getModel().getNextBoard();
                await getModel().removeCurrentBoard();
                if (nextBoard) {
                    await getModel().setCurrentBoard(nextBoard.id);
                }

            }

        }

    })().then(this.dispatchRefreshBoard);

}

export function dispatchRefreshBoard() {

    (async function() {

        const model = getModel();

        const boards = await model.getBoards();
        const currentBoardId = await model.getCurrentBoard();

        let currentBoard: Board | null = null;
        let columnsInBoard: Array<Column> | null = null;
        let columnTasks: Map<string, Array<Task>> = new Map();

        if (currentBoardId !== null) {
            currentBoard = await model.getBoardById(currentBoardId);
            columnsInBoard = await model.getColumnsByBoard(currentBoardId);
            for (let col of columnsInBoard) {
                const tasks = await model.getTasksByColumn(col.id);
                columnTasks.set(col.id, tasks);
            }
        }

        const store: BoardStore = {boards, currentBoard, columnsInBoard, columnTasks};

        dispatcher.dispatch("refreshBoard", store);

    })();

}