import {Column, ColumnOptions} from "../model/Column";
import dispatcher from "../Dispatcher";
import {getModel} from "../context";
import NonEmptyColumnException from "../model/NonEmptyColumnException";
import {BoardStore, FullStore} from "../stores/BoardStore";
import {Task, TaskPresentationalOptions} from "../model/Task";
import {Board} from "../model/Board";
import {Template} from "../model/Templates/Template";
import {createIndexedDBExportUrl} from "../model/util";
import DataExporter from "../model/export/DataExporter";

export function addColumn(columnName: string, wipLimit: number, options?: ColumnOptions) {
    getModel()
        .addColumn(columnName, wipLimit, options)
        .then(this.dispatchRefreshCurrentBoard);
}

export function addTask(column: Column, taskDesc: string, taskLongDesc?: string, presentationalOptions?: TaskPresentationalOptions) {
    getModel()
        .addTask(column.id, taskDesc, taskLongDesc, presentationalOptions)
        .then(this.dispatchRefreshCurrentBoard);
}

export function deleteTask(columnId: string, taskId: string) {
    getModel()
        .deleteTask(columnId, taskId)
        .then(this.dispatchRefreshCurrentBoard);
}

export function clear() {
    getModel()
        .clear()
        .then(() => {
            document.location.reload(true);
        });
}

export function setOrder(boardId: string, columnIds: Array<string>) {
    getModel()
        .setOrder(boardId, columnIds)
        .then(this.dispatchRefreshCurrentBoard);
}

export function editTask(taskId: string, newDesc: string, newLongDesc?: string, presentationalOptions?: TaskPresentationalOptions) {
    getModel()
        .editTask(taskId, newDesc, newLongDesc, presentationalOptions)
        .then(this.dispatchRefreshCurrentBoard);
}

export function moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {
    getModel()
        .moveTask(taskId, sourceColumnId, targetColumnId)
        .then(this.dispatchRefreshCurrentBoard);
}

export function removeColumn(boardId: string, columnId: string) {

    getModel()
        .removeColumn(boardId, columnId)
        .then(this.dispatchRefreshCurrentBoard)
        .catch(e => {
            if (e instanceof NonEmptyColumnException) {
                alert("Cannot remove a column that has tasks");
            } else {
                console.error(e);
                alert("Cannot remove column (see dev console)");
            }
        });
}

export function editColumn(column: Column, newName: string, newWip: number, options?: ColumnOptions) {
    getModel()
        .editColumn(column.id, newName, newWip, options)
        .then(this.dispatchRefreshCurrentBoard);
}

export function switchBoard(boardId: string) {
    getModel()
        .setCurrentBoard(boardId)
        .then(this.dispatchRefreshFull);
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
        .then(this.dispatchRefreshFull);

}

export function editCurrentBoard(boardName: string) {
    getModel()
        .editCurrentBoard(boardName)
        .then(this.dispatchRefreshFull);
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

    })().then(this.dispatchRefreshFull);

}

export function exportData() {

    const model = getModel();
    const exporter = new DataExporter(model);
    exporter.export().then((data) => {
        const json = JSON.stringify(data);
        createIndexedDBExportUrl(json);
    });
}

export function importFromJSON(json: string) {
    const model = getModel();
    const exporter = new DataExporter(model);
    exporter.import(JSON.parse(json)).then(this.dispatchRefreshFull);
}

async function buildBoardStoreFromModel() {
    const model = getModel();

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

    const store: BoardStore = {currentBoard, columnsInBoard, columnTasks};
    return store;
}

export function dispatchRefreshFull() {

    (async function() {

        console.time("dispatchRefreshFull");

        const model = getModel();

        const boards = await model.getBoards();
        const boardStore = await buildBoardStoreFromModel();
        const store: FullStore = {boards, ...boardStore};

        console.timeEnd("dispatchRefreshFull");

        dispatcher.dispatch("refreshFull", store);

    })();

}

export function dispatchRefreshCurrentBoard() {

    (async function() {

        console.time("dispatchRefreshCurrentBoard");
        const store = await buildBoardStoreFromModel();
        console.timeEnd("dispatchRefreshCurrentBoard");

        dispatcher.dispatch("refreshCurrentBoard", store);

    })();

}