import {expect} from "chai";
import {MapBasedStorage} from "./MapBasedStorage";
import TaskModel from "../src/model/TaskModel";
import LocalStorageDB from "../src/model/DB/LocalStorageDB";
import {DB} from "../src/model/DB/DB";
import {Column} from "../src/model/Column";
import 'mocha';
import DataExporter from "../src/model/export/DataExporter";
import {TaskPresentationalOptions} from "../src/model/Task";

describe("task model", function () {

    let storageMock: DB;
    let origDateNow = Date.now;

    beforeEach(function () {
        storageMock = new LocalStorageDB(new MapBasedStorage());
    });

    afterEach(function () {
       Date.now = origDateNow;
    });

    it("getBoards should return no boards when no boards are added", async function () {

        const taskModel = new TaskModel(storageMock);
        const boards = await taskModel.getBoards();

        expect(boards.length).to.equal(0);

    });

    it("addBoard should add an item to the map of boards", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const boards = await taskModel.getBoards();

        expect(boards.length).to.equal(1);

    });

    it("getColumns should return the list of columns, by order", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        await taskModel.addColumn("first");
        await taskModel.addColumn("second");

        const actualColumns: Array<Column> = await taskModel.getColumnsByBoard(board);

        expect(actualColumns[0].name).to.equal("first");
        expect(actualColumns[1].name).to.equal("second");

    });

    it("getColumnById should return the col of an existing column", async function() {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const colId = await taskModel.addColumn("foo");

        const col = await taskModel.getColumnById(colId);

        if (col === null) {
            expect.fail(null, col,"getColumnById failed to find existing column");
        } else {
            expect(col.name).to.equal("foo");
        }

    });

    it("getColumnById should return null for a column id that doesn't exist", async function() {
        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        await taskModel.addColumn("foo");

        const col = await taskModel.getColumnById("__non_existent_id__");

        expect(col).to.equal(null);
    });

    it("getTasks should return the list of tasks", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const key = await taskModel.addColumn("TODO");

        await taskModel.addTask(key, "foo");
        await taskModel.addTask(key, "bar");

        const actualTasksMap = await taskModel.getTasks();

        expect(actualTasksMap[0].desc).to.equal("foo");
        expect(actualTasksMap[1].desc).to.equal("bar");

    });

    it("delete task should remove the task from the list", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const columnKey = await taskModel.addColumn("TODO");

        await taskModel.addTask(columnKey, "foo");
        await taskModel.addTask(columnKey, "bar");

        const tasksForCol = await taskModel.getTasksByColumn(columnKey);

        await taskModel.deleteTask(columnKey, tasksForCol[0].id);

        const actualTasks = await taskModel.getTasks();

        expect(actualTasks.length).to.equal(1);

    });

    it("moveTask should move the task to the target column", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const firstCol = await taskModel.addColumn("foo");
        const secondCol = await taskModel.addColumn("bar");

        const taskKey = await taskModel.addTask(firstCol, "baz");
        await taskModel.moveTask(taskKey, firstCol, secondCol);

        const tasks = await taskModel.getTasksByColumn(secondCol);

        expect(tasks[0].id).to.equal(taskKey);

    });

    it("editTask should update the lastUpdatedAt property of the task", async function () {

        const taskModel = new TaskModel(storageMock);

        const dummyTimestamp = 1496000000000;
        Date.now = () => dummyTimestamp;

        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const col = await taskModel.addColumn("foo");
        const taskKey = await taskModel.addTask(col, "bar");

        await taskModel.editTask(taskKey, "modified bar");
        const tasks = await taskModel.getTasksByColumn(col);
        const theTask = tasks[0];

        if (! theTask.lastUpdatedAt) {
            expect.fail("lastUpdatedAt is undefined", "lastUpdatedAt should a Timestamp");
        } else {
            expect(theTask.lastUpdatedAt.value).to.equal(dummyTimestamp);
        }

    });

    it("getNextBoard should return the second board in a set of two boards", async function () {

        const taskModel = new TaskModel(storageMock);
        const board1 = await taskModel.addBoard("first");
        const board2 = await taskModel.addBoard("second");
        await taskModel.setCurrentBoard(board1);

        const nextBoard = await taskModel.getNextBoard();

        if (nextBoard === null) {
            throw new Error();
        }

        expect(nextBoard.id).to.equal(board2);

    });

    it("editCurrentBoard should only change the name of the current board", async function () {

        const taskModel = new TaskModel(storageMock);
        const board1 = await taskModel.addBoard("original name 1");
        await taskModel.addBoard("original name 2");
        await taskModel.setCurrentBoard(board1);

        await taskModel.editCurrentBoard("new name", false);

        const boards = await taskModel.getBoards();

        const boardName1 = boards[0];
        const boardName2 = boards[1];

        expect(boardName1.name).to.equal("new name");
        expect(boardName2.name).to.equal("original name 2");

    });

    it("getTasksByBoard should return the list of tasks in a board", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(boardId);

        const columnKey = await taskModel.addColumn("TODO");

        const t1id = await taskModel.addTask(columnKey, "foo");
        const t2id = await taskModel.addTask(columnKey, "bar");

        const tasks = await taskModel.getTasksByBoard(boardId);

        expect(tasks[0].id).to.equal(t1id);
        expect(tasks[1].id).to.equal(t2id);

    });

    it("removeCurrentBoard should remove all columns", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(boardId);

        await taskModel.addColumn("TODO");

        await taskModel.removeCurrentBoard();

        const cols = await taskModel.getColumns();

        expect(cols.length).to.equal(0);

    });

    it("export data should return an object that reflects the exact state of the model", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(boardId);

        const columnId = await taskModel.addColumn("TODO");

        const t1Id = await taskModel.addTask(columnId, "foo");
        const t2Id = await taskModel.addTask(columnId, "bar");

        const exporter = new DataExporter(taskModel);
        const data = await exporter.export();

        expect(data.boards.map(board => board.ref)).to.eql([boardId]);
        expect(data.cols.map(col => col.ref)).to.eql([columnId]);
        expect(data.cols[0].parentRef).to.eql(boardId);
        expect(data.tasks.map(task => task.ref)).to.eql([t1Id, t2Id]);
        expect(data.tasks[0].parentRef).to.eql(columnId);
        expect(data.tasks[1].parentRef).to.eql(columnId);

    });

    it("import data should copy the exported model into the existing model", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(boardId);

        const columnId = await taskModel.addColumn("TODO");

        await taskModel.addTask(columnId, "foo");
        await taskModel.addTask(columnId, "bar");

        const exporter = new DataExporter(taskModel);
        const data = await exporter.export();

        await exporter.import(data);

        const boards = await taskModel.getBoards();
        const cols = await taskModel.getColumns();
        const tasks = await taskModel.getTasks();

        expect(boards.map(board => board.name)).to.eql(["default", "default"]);
        expect(cols.map(col => col.name)).to.eql(["TODO", "TODO"]);
        expect(tasks.map(task => task.desc)).to.eql(["foo", "bar", "foo", "bar"]);

    });

    it("presentational options are persisted when adding a task", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("foo");
        await taskModel.setCurrentBoard(boardId);

        const columnId = await taskModel.addColumn("bar");

        const options: TaskPresentationalOptions = {
            color: "#fff"
        };
        await taskModel.addTask(columnId, "title", "long desc", options);

        const tasks = await taskModel.getTasks();

        const actualOptions = tasks[0].presentationalOptions || {};
        expect(actualOptions.color).to.equal("#fff");

    });

    it("base column should be saved on a new task", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("foo");
        await taskModel.setCurrentBoard(boardId);

        const columnId = await taskModel.addColumn("bar");

        await taskModel.addTask(columnId, "baz");

        const tasks = await taskModel.getTasks();

        expect(tasks[0].baseColumnId).to.equal(columnId);

    });

    it("base column should not change after moving a task", async function () {

        const taskModel = new TaskModel(storageMock);
        const boardId = await taskModel.addBoard("foo");
        await taskModel.setCurrentBoard(boardId);

        const column1Id = await taskModel.addColumn("col1");
        const column2Id = await taskModel.addColumn("col2");

        const taskId = await taskModel.addTask(column1Id, "baz");
        await taskModel.moveTask(taskId, column1Id, column2Id);

        const tasks = await taskModel.getTasks();

        expect(tasks[0].baseColumnId).to.equal(column1Id);

    });

});