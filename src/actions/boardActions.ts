import {Column} from "../model/column";
import dispatcher from "../Dispatcher";
import {getModel} from "../context";
import NonEmptyColumnException from "../model/NonEmptyColumnException";
import {BoardStore} from "../stores/BoardStore";

export function addColumn(columnName: string, wipLimit: number) {
    getModel()
        .addColumn(columnName, wipLimit)
        .then(() => {
            this.dispatchRefreshBoard();
        });
}

export function addTask(column: Column, taskDesc: string, taskLongDesc?: string) {
    getModel()
        .addTask(column.id, taskDesc, taskLongDesc)
        .then(this.dispatchRefreshBoard());
}

export function deleteTask(columnId: string, taskId: string) {
    getModel()
        .deleteTask(columnId, taskId)
        .then(this.dispatchRefreshBoard());
}

export function clear() {
    getModel()
        .clear()
        .then(this.dispatchRefreshBoard());
}

export function switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {
    getModel()
        .switchColumns(boardId, firstColumnId, secondColumnId)
        .then(this.dispatchRefreshBoard());
}

export function editTask(taskId: string, newDesc: string, newLongDesc?: string) {
    getModel()
        .editTask(taskId, newDesc, newLongDesc)
        .then(this.dispatchRefreshBoard());
}

export function moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {
    getModel()
        .moveTask(taskId, sourceColumnId, targetColumnId)
        .then(this.dispatchRefreshBoard());
}

export function removeColumn(boardId: string, columnId: string) {

    getModel()
        .removeColumn(boardId, columnId)
        .then(this.dispatchRefreshBoard())
        .catch(e => {
            if (e instanceof NonEmptyColumnException) {
                alert("You cannot remove a column that has tasks associated with it");
            } else {
                alert("Cannot remove column - unknown error");
            }
        });
}

export function editColumn(column: Column, newName: string, newWip: number) {
    getModel()
        .editColumn(column.id, newName, newWip)
        .then(this.dispatchRefreshBoard());
}

export function switchBoard(boardId: string) {
    getModel()
        .setCurrentBoard(boardId)
        .then(this.dispatchRefreshBoard());
}

export function addBoard(boardName: string) {

    getModel()
        .addBoard(boardName)
        .then((boardId) => {
            return getModel().setCurrentBoard(boardId);
        })
        .then(this.dispatchRefreshBoard());

}

export function editCurrentBoard(boardName: string) {
    getModel()
        .editCurrentBoard(boardName)
        .then(this.dispatchRefreshBoard());;
}

export function removeCurrentBoard() {

    (async function () {

        const currentBoard = await getModel().getCurrentBoard();
        if (currentBoard !== null) {
            const tasks = await getModel().getTasksByBoard(currentBoard);

            if (tasks.length > 0) {
                alert(`You cannot remove a non-empty board (${tasks.length} tasks found)`);
            } else {
                const nextBoard = await getModel().getNextBoard();
                await getModel().removeCurrentBoard();
                if (nextBoard) {
                    await getModel().setCurrentBoard(nextBoard);
                }

            }

        }

    })().then(() => {
        this.dispatchRefreshBoard();
    });

}

export function dispatchRefreshBoard() {

    (async function() {

        const model = getModel();

        const boards = await model.getBoards();
        const currentBoard = await model.getCurrentBoard();
        const boardColumns = await model.getBoardColumnsMap();
        const columnTasks = await model.getColumnTaskMap();

        const store: BoardStore = {boards, currentBoard, boardColumns, columnTasks};

        return store;

    })().then(store => {
        dispatcher.dispatch("refreshBoard", store);
    });

}