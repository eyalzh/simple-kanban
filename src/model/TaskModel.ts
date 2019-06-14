import {Column, ColumnOptions} from "./Column";
import {Task, TaskPresentationalOptions} from "./Task";
import {generateUniqId, getCurrentTime} from "./model_utils";
import NonEmptyColumnException from "./NonEmptyColumnException";
import {sanitizer} from "./sanitizer";
import {DB} from "./DB/DB";
import {Board} from "./Board";
import ColumnEffectsFactory from "./effects/ColumnEffectsFactory";
import ColumnEffectsHelper from "./effects/ColumnEffectsHelper";
import {lock} from "../util";

const SELECTED_BOARD_KEY = "selectedBoard";
const BOARD_MAP_NAME = "boardMap";
const BOARD_COL_MAP_NAME = "boardColMap";
const COLUMNS_MAP_NAME = "columnsMap";
const COL_TASK_MAP_NAME = "colTaskMap";
const TASKS_NAME = "tasks";
const FLAG_MAP_NAME = "flagMap";

export enum FLAGS {TUTORIAL_ADDED}

export default class TaskModel {

    constructor(private readonly db: DB) {}

    public async init(): Promise<void> {
        return this.db.init([
            {
                storeName: BOARD_MAP_NAME,
                storeKey: "id"
            },
            {
                storeName: BOARD_COL_MAP_NAME,
                storeKey: "boardId"
            },
            {
                storeName: COLUMNS_MAP_NAME,
                storeKey: "id"
            },
            {
                storeName: COL_TASK_MAP_NAME,
                storeKey: "columnId"
            },
            {
                storeName: TASKS_NAME,
                storeKey: "id"
            },
            {
                storeName: FLAG_MAP_NAME,
                storeKey: "flagId"
            },
        ]);
    }

    public async getCurrentBoard(): Promise<string | null> {
       return this.db.getItem<string>(SELECTED_BOARD_KEY);
    }

    public async setCurrentBoard(boardId: string) {
        try {
            await this.db.getDocumentByKey(BOARD_MAP_NAME, boardId);
            await this.db.setItem(SELECTED_BOARD_KEY, boardId);
        } catch (e) {
            throw new Error(`board ${boardId} does not exist`);
        }
    }

    public async getBoards(): Promise<Array<Board>> {
        return this.db.getAll<Board>(BOARD_MAP_NAME);
    }

    public async getNextBoard(): Promise<Board | null> {

        const currentBoard = await this.getCurrentBoard();

        if (currentBoard === null) {
            return null;
        }

        const boards = await this.getBoards();
        const idx = boards.findIndex((board) => board.id === currentBoard);

        if (idx === -1) {
            throw new Error(`inconsistent data: ${currentBoard} cannot be found in board list`);
        }

        const nextBoard = boards[(idx + 1) % boards.length];
        return nextBoard;

    }

    public async getColumns(): Promise<Array<Column>> {
        return this.db.getAll<Column>(COLUMNS_MAP_NAME);
    }

    public async getTasks(): Promise<Array<Task>> {
        return this.db.getAll<Task>(TASKS_NAME);
    }

    public async getTasksByColumn(columnId: string): Promise<Array<Task>> {

        const tasks: Array<Task> = [];
        const columnTasks = await this.db.getDocumentByKey<Array<string>>(COL_TASK_MAP_NAME, columnId);

        if (columnTasks) {

            for (const taskId of columnTasks) {
                const task =  await this.db.getDocumentByKey<Task>(TASKS_NAME, taskId);
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

        const cols: Array<Column> = [];
        const boardsToColsMap = await this.db.getDocumentByKey<Array<string>>(BOARD_COL_MAP_NAME, boardId);

        if (boardsToColsMap !== null) {
            for (const colId of boardsToColsMap) {
                const col = await this.getColumnById(colId);
                if (col) {
                    cols.push(col);
                }
            }
        }

        return cols;
    }

    public async getColumnById(columnId: string): Promise<Column | null> {
        try {
            return await this.db.getDocumentByKey<Column>(COLUMNS_MAP_NAME, columnId);
        } catch (ex) {
            return null;
        }
    }

    public async addColumn(name: string, wipLimit?: number, options?: ColumnOptions): Promise<string> {

        const currentBoard = await this.getCurrentBoard();
        if (currentBoard === null) {
            throw new Error("can't add column - no active board found");
        }

        await this.db.getDocumentByKey(BOARD_COL_MAP_NAME, currentBoard);

        const newKey = await generateUniqId(this.db, "col");
        const sanitizedName = sanitizer.sanitizeColName(name);

        const newCol: Column = {
            id: newKey,
            name: sanitizedName,
            wipLimit: sanitizer.sanitizeWipLimit(wipLimit, 3),
            options,
            effects: ColumnEffectsHelper.parseEffectsFromName(sanitizedName)
        };

        await this.db.addToStore(COLUMNS_MAP_NAME, newKey, newCol);
        await this.db.addToStore(COL_TASK_MAP_NAME, newKey, []);
        await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, currentBoard, (value) => value.concat(newKey));

        return newKey;
    }

    public async addBoard(boardName: string) {
        const newKey = await generateUniqId(this.db, "board");

        const board: Board = {
            id: newKey,
            name: sanitizer.sanitizeBoardName(boardName)
        };

        await this.db.addToStore(BOARD_MAP_NAME, newKey, board);
        await this.db.addToStore(BOARD_COL_MAP_NAME, newKey, []);

        return newKey;
    }

    public async getBoardById(currentBoardId: string) {
        return this.db.getDocumentByKey<Board>(BOARD_MAP_NAME, currentBoardId);
    }

    public async editCurrentBoard(boardName: string, isArchived: boolean) {

        const currentBoard = await this.getCurrentBoard();

        if (currentBoard === null) {
            throw new Error("There is no active board to edit");
        } else {

            const board: Board = {
                id: currentBoard,
                name: sanitizer.sanitizeBoardName(boardName),
                isArchived
            };

            await this.db.modifyStore<Board>(BOARD_MAP_NAME, currentBoard, () => board);
        }

   }

    public async editColumn(columnId: string, columnName: string, wipLimit: number, options?: ColumnOptions) {

        await this.db.modifyStore<Column>(COLUMNS_MAP_NAME, columnId, (col) => {
            col.name = sanitizer.sanitizeColName(columnName);
            col.wipLimit = sanitizer.sanitizeWipLimit(wipLimit, 3);
            col.options = options;
            col.effects = ColumnEffectsHelper.parseEffectsFromName( col.name);
            return col;
        });

    }

    public async addTask(
        columnId: string,
        desc: string,
        longdesc?: string,
        presentationalOptions?: TaskPresentationalOptions,
        baseColumnId?: string,
        linkToBoardId?: string,
        steamVol?: number): Promise<string> {

        const newKey = await generateUniqId(this.db, "task");
        const now = getCurrentTime();

        const newTask: Task = {
            id: newKey,
            desc: sanitizer.sanitizeTaskTitle(desc),
            longdesc: typeof longdesc !== "undefined" ? longdesc : "",
            createdAt: now,
            presentationalOptions,
            baseColumnId: typeof baseColumnId !== "undefined" ? baseColumnId : columnId,
            counters: [{value: 0}],
            linkToBoardId,
            steamVol: typeof steamVol !== "undefined" ? Math.max(0, steamVol) : 0,
            lastSteamReleased: now
        };

        await this.db.addToStore(TASKS_NAME, newKey, newTask);
        await this.db.modifyStore<string>(COL_TASK_MAP_NAME, columnId, (tasksInCol) => tasksInCol.concat(newKey));

        return newKey;
    }

    @lock("board")
    public async moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {

        if (sourceColumnId === targetColumnId) {
            return;
        }

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, sourceColumnId, (tasks) => {
            return tasks.filter(task => task !== taskId);
        });

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, targetColumnId, (tasks) => {
            return tasks.concat(taskId);
        });

        const col = await this.getColumnById(targetColumnId);
        if (col) {
            await this.db.modifyStore<Task>(TASKS_NAME, taskId, (task) => {
                let newTask = task;
                (col.effects || []).forEach(({id, config}) => {
                    const effect = ColumnEffectsFactory.getColumnEffectById(id);
                    if (effect) {
                        newTask = effect.modifyTask(newTask, config);
                    }
                });
                if (col.options && col.options.steamRelease) {
                    newTask.lastSteamReleased = getCurrentTime();
                }
                return newTask;
            });
        }

    }

    @lock("board")
    public async deleteTask(columnId: string, taskId: string) {
        await this.detachTask(columnId, taskId);
        await this.db.deleteStoreItem(TASKS_NAME, taskId);
    }

    @lock("board")
    public async setOrder(boardId: string, columnIds: Array<string>) {

        await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, boardId, () => {
            return columnIds;
        });

    }

    public async editTask(
        taskId: string,
        newDesc: string,
        newLongDesc?: string,
        presentationalOptions?: TaskPresentationalOptions,
        baseColumnId?: string,
        linkToBoardId?: string,
        steamVol?: number) {

        await this.db.modifyStore<Task>(TASKS_NAME, taskId, (task) => {
            task.desc = sanitizer.sanitizeTaskTitle(newDesc);
            task.longdesc = typeof newLongDesc !== "undefined" ? newLongDesc : "";
            task.lastUpdatedAt = getCurrentTime();
            task.presentationalOptions = {...presentationalOptions};
            task.counters = task.counters || [{value: 0}];
            if (typeof baseColumnId !== "undefined") {
                task.baseColumnId = baseColumnId;
            }
            task.linkToBoardId = linkToBoardId;
            task.steamVol = typeof steamVol !== "undefined" ? Math.max(0, steamVol) : 0;
            return task;
        });
    }

    @lock("board")
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

    public async resetCurrentBoard() {

        const boardId = await this.getCurrentBoard();

        if (boardId !== null) {

            const cols = await this.getColumnsByBoard(boardId);

            for (const col of cols) {
                const tasks = await this.getTasksByColumn(col.id);

                for (const task of tasks) {
                    if (task && task.baseColumnId) {
                        await this.moveTask(task.id, col.id, task.baseColumnId);
                    }
                }

            }

        }
    }

    public async clear() {
        await this.db.clear();
        await this.initData();
    }

    public async setFlagOn(flag: FLAGS) {
        await this.db.addToStore(FLAG_MAP_NAME, FLAGS[flag], true);
    }

    public async getFlag(flag: FLAGS): Promise<boolean> {
        const flagValue = await this.db.getDocumentByKey(FLAG_MAP_NAME, FLAGS[flag]);
        return !!flagValue;
    }

    public async runMaintenance() {
        await this.db.runMaintenance();
    }

    private async detachTask(columnId: string, taskId: string) {

        await this.db.modifyStore<Array<string>>(COL_TASK_MAP_NAME, columnId, (tasks) => {
           return tasks.filter(task => task !== taskId);
        });

    }

    private async initData() {
        const currentBoard = await this.getCurrentBoard();
        if (currentBoard !== null) {
            try {
                await this.db.getDocumentByKey(BOARD_COL_MAP_NAME, currentBoard);
            } catch (e) {
                await this.db.modifyStore<Array<string>>(BOARD_COL_MAP_NAME, currentBoard, () => []);
            }
        }
    }

}
