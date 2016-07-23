import {Column} from "../model/column";
import dispatcher from "../Dispatcher";
import {getModel} from "../context";
import NonEmptyColumnException from "../model/NonEmptyColumnException";

export function addColumn(columnName: string, wipLimit: number) {
    getModel().addColumn(columnName, wipLimit);
    dispatcher.dispatch("addColumn", {
        name: columnName,
    });
}

export function addTask(column: Column, taskDesc: string, taskLongDesc?: string) {
    getModel().addTask(column.id, taskDesc, taskLongDesc);
    dispatcher.dispatch("addTask", {
        column: column.id
    });
}

export function deleteTask(columnId: string, taskId: string) {
    getModel().deleteTask(columnId, taskId);
    dispatcher.dispatch("refreshAll", {});
}

export function clear() {
    getModel().clear();
    dispatcher.dispatch("refreshBoard", {});
}

export function switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {
    getModel().switchColumns(boardId, firstColumnId, secondColumnId);
    dispatcher.dispatch("refreshBoard", {});
}

export function editTask(taskId: string, newDesc: string, newLongDesc?: string) {
    getModel().editTask(taskId, newDesc, newLongDesc);
    dispatcher.dispatch("refreshAll", {});
}

export function moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {
    getModel().moveTask(taskId, sourceColumnId, targetColumnId);
    dispatcher.dispatch("refreshAll", {});
}

export function removeColumn(boardId: string, columnId: string) {
    try {
        getModel().removeColumn(boardId, columnId);
        dispatcher.dispatch("refreshBoard", {});
    } catch (e) {
        if (e instanceof NonEmptyColumnException) {
            alert("You cannot remove a column that has tasks associated with it");
        } else {
            alert("Cannot remove column - unknown error");
        }
    }
}

export function editColumn(column: Column, newName: string, newWip: number) {
    getModel().editColumn(column.id, newName, newWip);
    dispatcher.dispatch("refreshAll", {});
}

export function switchBoard(boardId: string) {
    getModel().setCurrentBoard(boardId);
    dispatcher.dispatch("refreshBoard", {});
}

export function addBoard(boardName: string) {
    const boardId = getModel().addBoard(boardName);
    getModel().setCurrentBoard(boardId);
    dispatcher.dispatch("refreshBoard", {});
}

export function removeCurrentBoard() {
    const currentBoard = getModel().getCurrentBoard();
    const tasks = getModel().getTasksByBoard(currentBoard);
    if (tasks.length > 0) {
        alert(`You cannot remove a non-empty board (${tasks.length} tasks found)`);
    } else {
        const nextBoard = getModel().getNextBoard();
        getModel().removeCurrentBoard();
        if (nextBoard) {
            getModel().setCurrentBoard(nextBoard);
        }
        dispatcher.dispatch("refreshBoard", {});
    }
}