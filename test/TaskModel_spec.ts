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

    it("getColumns should return the list of columns, by order", function () {

        const taskModel = new TaskModel(storageMock);
        const board = taskModel.addBoard("default");
        taskModel.setCurrentBoard(board);

        taskModel.addColumn("first");
        taskModel.addColumn("second");

        const actualColumns: Array<Column> = taskModel.getColumnsByBoard(board);

        expect(actualColumns[0].name).to.equal("first");
        expect(actualColumns[1].name).to.equal("second");

    });

    it("getTasks should return the list of tasks", function () {

        const taskModel = new TaskModel(storageMock);
        const board = taskModel.addBoard("default");
        taskModel.setCurrentBoard(board);

        const key = taskModel.addColumn("TODO");

        taskModel.addTask(key, "foo");
        taskModel.addTask(key, "bar");

        const actualTasksMap = taskModel.getTasks();
        const taskValueIter = actualTasksMap.values();

        expect(taskValueIter.next().value.desc).to.equal("foo");
        expect(taskValueIter.next().value.desc).to.equal("bar");

    });

    it("delete task should remove the task from the list", function () {

        const taskModel = new TaskModel(storageMock);
        const board = taskModel.addBoard("default");
        taskModel.setCurrentBoard(board);

        const columnKey = taskModel.addColumn("TODO");

        taskModel.addTask(columnKey, "foo");
        taskModel.addTask(columnKey, "bar");

        const tasksForCol = taskModel.getTasksByColumn(columnKey);

        taskModel.deleteTask(columnKey, tasksForCol[0].id);

        const actualTasks = taskModel.getTasks();

        expect(actualTasks.size).to.equal(1);

    });

    it("moveTask should move the task to the target column", function () {

        const taskModel = new TaskModel(storageMock);
        const board = taskModel.addBoard("default");
        taskModel.setCurrentBoard(board);

        const firstCol = taskModel.addColumn("foo");
        const secondCol = taskModel.addColumn("bar");

        const taskKey = taskModel.addTask(firstCol, "baz");
        taskModel.moveTask(taskKey, firstCol, secondCol);

        const tasks = taskModel.getTasksByColumn(secondCol);

        expect(tasks[0].id).to.equal(taskKey);

    });

});