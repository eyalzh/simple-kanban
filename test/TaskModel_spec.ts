import {expect} from "chai";
import {MapBasedStorage} from "./MapBasedStorage";
import TaskModel from "../src/model/TaskModel";
import LocalStorageDB from "../src/model/DB/LocalStorageDB";
import {DB} from "../src/model/DB/DB";
import {Column} from "../src/model/Column";
import 'mocha';

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

        await taskModel.editCurrentBoard("new name");

        const boards = await taskModel.getBoards();

        const boardName1 = boards[0];
        const boardName2 = boards[1];

        expect(boardName1.name).to.equal("new name");
        expect(boardName2.name).to.equal("original name 2");

    });

    it("getTasksByBoard should return the list of tasks in a board", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        const columnKey = await taskModel.addColumn("TODO");

        const t1id = await taskModel.addTask(columnKey, "foo");
        const t2id = await taskModel.addTask(columnKey, "bar");

        const tasks = await taskModel.getTasksByBoard(board);

        expect(tasks[0].id).to.equal(t1id);
        expect(tasks[1].id).to.equal(t2id);

    });

    it("removeCurrentBoard should remove all columns", async function () {

        const taskModel = new TaskModel(storageMock);
        const board = await taskModel.addBoard("default");
        await taskModel.setCurrentBoard(board);

        await taskModel.addColumn("TODO");

        await taskModel.removeCurrentBoard();

        const cols = await taskModel.getColumns();

        expect(cols.length).to.equal(0);

    });


});