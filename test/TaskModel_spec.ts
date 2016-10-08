import {expect} from "chai";
import {MapBasedStorage} from "./MapBasedStorage";
import TaskModel from "../src/model/TaskModel";
import LocalStorageDB from "../src/model/DB/LocalStorageDB";
import {DB} from "../src/model/DB/DB";
import {Column} from "../src/model/Column";

describe("task model", function () {

    var storageMock: DB;

    beforeEach(function () {
        storageMock = new LocalStorageDB(new MapBasedStorage());
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
        const taskValueIter = actualTasksMap.values();

        expect(taskValueIter.next().value.desc).to.equal("foo");
        expect(taskValueIter.next().value.desc).to.equal("bar");

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

        expect(actualTasks.size).to.equal(1);

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

    it("getNextBoard should return the second board in a set of two boards", async function () {

        const taskModel = new TaskModel(storageMock);
        const board1 = await taskModel.addBoard("first");
        const board2 = await taskModel.addBoard("second");
        await taskModel.setCurrentBoard(board1);

        const nextBoard = await taskModel.getNextBoard();

        expect(nextBoard).to.equal(board2);

    });

    it("editCurrentBoard should only change the name of the current board", async function () {

        const taskModel = new TaskModel(storageMock);
        const board1 = await taskModel.addBoard("original name 1");
        const board2 = await taskModel.addBoard("original name 2");
        await taskModel.setCurrentBoard(board1);

        await taskModel.editCurrentBoard("new name");

        const boards = await taskModel.getBoards();

        const boardName1 = boards.get(board1);
        const boardName2 = boards.get(board2);

        expect(boardName1).to.equal("new name");
        expect(boardName2).to.equal("original name 2");

    });

});