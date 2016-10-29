import {Column} from "./Column";
import {Task} from "./Task";
import {generateUniqId} from "./util";
import NonEmptyColumnException from "./NonEmptyColumnException";
import {sanitizer} from "./sanitizer";
import {DB} from "./DB/DB";

const SELECTED_BOARD_KEY = "selectedBoard";
const BOARD_MAP_NAME = "boardMap";
const BOARD_COL_MAP_NAME = "boardColMap";
const COLUMNS_MAP_NAME = "columnsMap";
const COL_TASK_MAP_NAME = "colTaskMap";
const TASKS_NAME = "tasks";
const FLAG_MAP_NAME = "flagMap";

export enum FLAGS {TUTORIAL_ADDED}

export default class TaskModel {

    private db: DB;

    constructor(db: DB) {
        this.db = db;
    }

    public async init(): Promise<void> {
        return await this.db.init([
            {
                storeName: BOARD_MAP_NAME,
                storeKey: "boardId"
            },
            {
                storeName: BOARD_COL_MAP_NAME,
                storeKey: "boardId"
            },
            {
                storeName: COLUMNS_MAP_NAME,
                storeKey: "columnId"
            },
            {
                storeName: COL_TASK_MAP_NAME,
                storeKey: "columnId"
            },
            {
                storeName: TASKS_NAME,
                storeKey: "taskId"
            },
            {
                storeName: FLAG_MAP_NAME,
                storeKey: "flagId"
            },
        ]);
    }

    public async getCurrentBoard(): Promise<string | null> {
       return await this.db.getItem(SELECTED_BOARD_KEY);
    }

    public async setCurrentBoard(boardId: string) {
       await this.db.setItem(SELECTED_BOARD_KEY, boardId);
    }

    public async getBoards(): Promise<Map<string, string>> {
        return await this.db.getMap<string>(BOARD_MAP_NAME);
    }

    public async getNextBoard(): Promise<string | null> {
        const currentBoard = await this.getCurrentBoard();
        if (currentBoard === null) {
            return null;
        }
        const keys = [...(await this.getBoards()).keys()];
        const next = (keys.indexOf(currentBoard) + 1) % keys.length;
        return keys[next];
    }

    public async getColumns(): Promise<Map<string, Column>> {
        return await this.db.getMap<Column>(COLUMNS_MAP_NAME);
    }

    public async getTasks(): Promise<Map<string, Task>> {
        return await this.db.getMap<Task>(TASKS_NAME);
    }

    public async getTasksByColumn(columnId: string): Promise<Array<Task>> {

        console.log("getTasksByColumn");

        let tasks: Array<Task> = [];
        const columnTasks = await this.db.getDocumentByKey<Array<string>>(COL_TASK_MAP_NAME, columnId);
        const allTasks = await this.getTasks();

        if (columnTasks) {
            for (let taskId of columnTasks) {
                const task = allTasks.get(taskId);
                if (task) {
                    tasks.push(task);
                }
            }
        } else {
            throw new Error(`Column ${columnId} was not found`);
        }

        return tasks;
    }

    public async getTasksByBoard(boardId: string): Promise<Array<Task>> {
        const cols = await this.getColumnsByBoard(boardId);
        let tasks: Array<Task> = [];

        const taskMods = cols.map(col => {
            return (async () => {
                if (col) {
                    const colTasks = await this.getTasksByColumn(col.id);
                    tasks = tasks.concat(colTasks);
                }
            })();
        });

        await Promise.all(taskMods);

        return tasks;
    }

    public async getColumnsByBoard(boardId: string): Promise<Array<Column>> {

        let cols: Array<Column> = [];
        const allCols = await this.getColumns();
        const boardsToColsMap = await this.db.getMap<Array<string>>(BOARD_COL_MAP_NAME);

        if (boardsToColsMap.has(boardId)) {
            const colMap = boardsToColsMap.get(boardId);
            if (colMap) {
                colMap.forEach(colId => {
                    const col = allCols.get(colId);
                    if (col) {
                        cols.push(col);
                    }
                });
            }
        } else {
            throw new Error(`Board ${boardId} could not be found`);
        }

        return cols;
    }

    public async addColumn(name: string, wipLimit = 3): Promise<string> {

        const currentBoard = await this.getCurrentBoard();
        if (currentBoard === null) {
            throw new Error("can't add column - no active board found");
        }

        const boardsToColsMap = await this.db.getMap<Array<string>>(BOARD_COL_MAP_NAME);
        let colsInBoard = boardsToColsMap.get(currentBoard);
        if (! colsInBoard) {
            throw new Error("can't add column - corrupted board data");
        }

        const newKey = await generateUniqId(this.db, "col");
        const newCol: Column = {
            id: newKey,
            name: sanitizer.sanitizeColName(name),
            wipLimit: sanitizer.sanitizeWipLimit(wipLimit, 3)
        };

        await this.db.addToStore(COLUMNS_MAP_NAME, newKey, newCol);
        await this.db.addToStore(COL_TASK_MAP_NAME, newKey, []);
        await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, currentBoard, (value) => value.concat(newKey));

        return newKey;
    }

    public async addBoard(boardName: string) {
        const newKey = await generateUniqId(this.db, "board");

        await this.db.addToStore(BOARD_MAP_NAME, newKey, sanitizer.sanitizeBoardName(boardName));
        await this.db.addToStore(BOARD_COL_MAP_NAME, newKey, []);

        return newKey;
    }

    public async editCurrentBoard(boardName: string) {

        const currentBoard = await this.getCurrentBoard();

        if (currentBoard === null) {
            throw new Error("There is no active board to edit");
        } else {
            await this.db.modifyStore<string>(BOARD_MAP_NAME, currentBoard, () => sanitizer.sanitizeBoardName(boardName));
        }

   }

    public async editColumn(columnId: string, columnName: string, wipLimit: number) {

        await this.db.modifyStore<Column>(COLUMNS_MAP_NAME, columnId, (col) => {
            col.name = sanitizer.sanitizeColName(columnName);
            col.wipLimit = sanitizer.sanitizeWipLimit(wipLimit, 3);
            return col;
        });

    }

    public async addTask(columnId: string, desc: string, longdesc?: string): Promise<string> {

        const newKey = await generateUniqId(this.db, "task");

        const newTask: Task = {
            id: newKey,
            desc: sanitizer.sanitizeTaskTitle(desc),
            longdesc: typeof longdesc !== "undefined" ? longdesc : ""
        };

        await this.db.addToStore(TASKS_NAME, newKey, newTask);
        await this.db.modifyStore<string>(COL_TASK_MAP_NAME, columnId, (tasksInCol) => tasksInCol.concat(newKey));

        return newKey;
    }

    public async moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, sourceColumnId, (tasks) => {
            return tasks.filter(task => task !== taskId);
        });

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, targetColumnId, (tasks) => {
            return tasks.concat(taskId);
        });

    }

    public async deleteTask(columnId: string, taskId: string) {
        await this.detachTask(columnId, taskId);
        await this.db.deleteStoreItem(TASKS_NAME, taskId);
    }

    public async switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {

        await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, boardId, (columns) => {
            const firstIdx = columns.indexOf(firstColumnId);
            const secondIdx = columns.indexOf(secondColumnId);
            columns[firstIdx] = secondColumnId;
            columns[secondIdx] = firstColumnId;
            return columns;
        });

    }

    public async editTask(taskId: string, newDesc: string, newLongDesc?: string) {
        await this.db.modifyStore<Task>(TASKS_NAME, taskId, (task) => {
            task.desc = sanitizer.sanitizeTaskTitle(newDesc);
            task.longdesc = typeof newLongDesc !== "undefined" ? newLongDesc : "";
            return task;
        });
    }

    public async removeColumn(boardId: string, columnId: string) {

        const tasks = await this.getTasksByColumn(columnId);
        if (tasks.length > 0) {
            throw new NonEmptyColumnException();
        }

        await this.db.deleteStoreItem(COL_TASK_MAP_NAME, columnId);

        await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, boardId, (colsInBoard) => {
           return colsInBoard.filter(colId => colId !== columnId);
        });

        await this.db.deleteStoreItem(COLUMNS_MAP_NAME, columnId);
    }

    public async removeCurrentBoard() {
        const boardId = await this.getCurrentBoard();
        if (boardId !== null) {
            const cols = await this.getColumnsByBoard(boardId);

            const colMods = cols.map(col => {
                return (async () => {
                    if (col) {
                        await this.removeColumn(boardId, col.id);
                    }
                })();
            });

            await Promise.all(colMods);

            await this.db.deleteStoreItem(BOARD_MAP_NAME, boardId);
            await this.db.deleteStoreItem(BOARD_COL_MAP_NAME, boardId);

        }
    }

    public async clear() {
        await this.db.clear();
        await this.initData();
    }

    public async getBoardColumnsMap(): Promise<Map<string, Array<Column>>> {

        const boardsToColsMap = await this.db.getMap<Array<string>>(BOARD_COL_MAP_NAME);
        const allCols = await this.getColumns();
        const res: Map<string, Array<Column>> = new Map();

        boardsToColsMap.forEach((colIds, boardId) => {

            const cols = colIds.map(colId => {
                const col = allCols.get(colId);
                if (col) {
                    return col;
                } else {
                    throw new Error(`Inconsistent model: can't find ${colId} in columns`);
                }
            });

            res.set(boardId, cols);

        });

        return res;

    }

    public async getColumnTaskMap(): Promise<Map<string, Array<Task>>> {
        const colTaskMap = await this.db.getMap<Array<string>>(COL_TASK_MAP_NAME);
        const allTasks = await this.getTasks();
        const res: Map<string, Array<Task>> = new Map();

        colTaskMap.forEach((tasksIds, colId) => {

            const tasks = tasksIds.map(taskId => {
                const task = allTasks.get(taskId);
                if (task) {
                    return task;
                } else {
                    throw new Error(`Inconsistent model: can't find ${taskId} in tasks`);
                }
            });

            res.set(colId, tasks);

        });


        return res;

    }

    public async setFlagOn(flag: FLAGS) {
        await this.db.modifyStore<boolean>(FLAG_MAP_NAME, FLAGS[flag], () => true);
    }

    public async getFlag(flag: FLAGS): Promise<boolean> {
        const flagMap = await this.db.getMap<boolean>(FLAG_MAP_NAME);
        const flagValue = flagMap.get(FLAGS[flag]);
        return !!flagValue;
    }

    private async detachTask(columnId: string, taskId: string) {

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, columnId, (tasks) => {
           return tasks.filter(task => task !== taskId);
        });

    }

    private async initData() {
        const boardsToColsMap = await this.db.getMap<Array<string>>(BOARD_COL_MAP_NAME);
        const currentBoard = await this.getCurrentBoard();
        if (currentBoard !== null && !boardsToColsMap.has(currentBoard)) {
            await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, currentBoard, () => []);
        }
    }

}