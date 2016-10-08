import {Column} from "./Column";
import {Task} from "./Task";
import {generateUniqId} from "./util";
import NonEmptyColumnException from "./NonEmptyColumnException";
import {sanitizer} from "./sanitizer";
import {DB} from "./DB/DB";

export default class TaskModel {

    private db: DB;

    constructor(db: DB) {
        this.db = db;
    }

    public async getCurrentBoard(): Promise<string | null> {
       return await this.db.getItem("selectedBoard");
    }

    public async setCurrentBoard(boardId: string) {
       await this.db.setItem("selectedBoard", boardId);
    }

    public async getBoards(): Promise<Map<string, string>> {
        return await this.db.getMap<string>("boardMap");
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
        return await this.db.getMap<Column>("columnsMap");
    }

    public async getTasks(): Promise<Map<string, Task>> {
        return await this.db.getMap<Task>("tasks");
    }
    
    public async getTasksByColumn(columnId: string): Promise<Array<Task>> {

        let tasks: Array<Task> = [];
        const allTasks = await this.getTasks();
        const map = await this.db.getMap<Array<string>>("colTaskMap");

        if (! map) {
            throw new Error("could not fetch column task map");
        }

        const columnTasks = map.get(columnId);

        if (columnTasks) {
            for(let taskId of columnTasks) {
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
            return async function() {
                if (col) {
                    const colTasks = await this.getTasksByColumn(col.id);
                    tasks = tasks.concat(colTasks);
                }
            }
        });

        await Promise.all(taskMods);

        return tasks;
    }

    public async getColumnsByBoard(boardId: string): Promise<Array<Column>> {

        let cols: Array<Column> = [];
        const allCols = await this.getColumns();
        const boardsToColsMap = await this.db.getMap<Array<string>>("boardColMap");

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

        const boardsToColsMap = await this.db.getMap<Array<string>>("boardColMap");
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

        const cols = await this.getColumns();
        cols.set(newKey, newCol);

        await this.db.setMap("columnsMap", cols);

        const colsTasksMap = await this.db.getMap<Array<string>>("colTaskMap");
        colsTasksMap.set(newKey, []);
        await this.db.setMap("colTaskMap", colsTasksMap);

        colsInBoard = colsInBoard.concat(newKey);
        boardsToColsMap.set(currentBoard, colsInBoard);

        await this.db.setMap("boardColMap", boardsToColsMap);

        return newKey;
    }

    public async addBoard(boardName: string) {
        const newKey = await generateUniqId(this.db, "board");

        const boardMap = await this.db.getMap<string>("boardMap");
        boardMap.set(newKey, sanitizer.sanitizeBoardName(boardName));
        this.db.setMap("boardMap", boardMap);

        const boardsToColsMap = await this.db.getMap<Array<string>>("boardColMap");
        boardsToColsMap.set(newKey, []);
        this.db.setMap("boardColMap", boardsToColsMap);

        return newKey;
    }

    public async editCurrentBoard(boardName: string) {

        const boardMap = await this.db.getMap<string>("boardMap");
        const currentBoard = await this.getCurrentBoard();

        if (currentBoard === null) {
            throw new Error("There is no active board to edit");
        } else {
            boardMap.set(currentBoard, sanitizer.sanitizeBoardName(boardName));
            await this.db.setMap("boardMap", boardMap);
        }

   }

    public async editColumn(columnId: string, columnName: string, wipLimit: number) {

        const columnsMap = await this.getColumns();
        const col = columnsMap.get(columnId);

        if (! col) {
            throw new Error(`column ${columnId} doesn't exist`);
        }

        col.name = sanitizer.sanitizeColName(columnName);
        col.wipLimit = sanitizer.sanitizeWipLimit(wipLimit, 3);

        await this.db.setMap("columnsMap", columnsMap)

    }

    public async addTask(columnId: string, desc: string, longdesc?: string): Promise<string> {

        const map = await this.db.getMap<string>("colTaskMap");
        let tasksInCol = map.get(columnId);

        if (! tasksInCol) {
            throw new Error(`can't add task to column ${columnId} - corrupted data`);
        }

        const newKey = await generateUniqId(this.db, "task");

        const newTask: Task = {
            id: newKey,
            desc: sanitizer.sanitizeTaskTitle(desc),
            longdesc: typeof longdesc !== "undefined" ? longdesc : ""
        };

        const taskMap = await this.getTasks();
        taskMap.set(newKey, newTask);

        tasksInCol = tasksInCol.concat(newKey);
        map.set(columnId, tasksInCol);

        await this.db.setMap("tasks", taskMap);
        await this.db.setMap("colTaskMap", map);

        return newKey;
    }

    public async moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {

        const colTaskMap = await this.db.getMap<Array<string>>("colTaskMap");

        const existingColTasks = colTaskMap.get(sourceColumnId);

        if (! existingColTasks) {
            throw new Error(`Can't move task from ${sourceColumnId} - corrupted data`);
        }

        const theTask = existingColTasks.find(task => task === taskId);
        if (! theTask) {
            throw new Error(`Count not find task ${taskId} in source column`);
        }

        const targetTasks = colTaskMap.get(targetColumnId);
        if (! targetTasks) {
            throw new Error(`Can't move task to ${targetColumnId} - corrupted data`);
        }

        colTaskMap.set(sourceColumnId, existingColTasks.filter(task => task !== taskId));
        colTaskMap.set(targetColumnId, targetTasks.concat(theTask));

        await this.db.setMap("colTaskMap", colTaskMap);

    }

    public async deleteTask(columnId: string, taskId: string) {

        await this.detachTask(columnId, taskId);

        const tasks = await this.getTasks();
        tasks.delete(taskId);
        await this.db.setMap("tasks", tasks);
    }

    public async switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {

        const boardColMap = await this.db.getMap<Array<string>>("boardColMap");
        let columns = boardColMap.get(boardId);

        if (! columns) {
            throw new Error(`can't find columns for board ${boardId}`);
        }

        const firstIdx = columns.indexOf(firstColumnId);
        const secondIdx = columns.indexOf(secondColumnId);
        columns[firstIdx] = secondColumnId;
        columns[secondIdx] = firstColumnId;

        boardColMap.set(boardId, columns);

        await this.db.setMap("boardColMap", boardColMap)

    }

    public async editTask(taskId: string, newDesc: string, newLongDesc?: string) {
        
        const tasks = await this.getTasks();

        let task = tasks.get(taskId);

        if (! task) {
            throw new Error(`Can't find task ${taskId}`);
        }

        task.desc = sanitizer.sanitizeTaskTitle(newDesc);
        task.longdesc = typeof newLongDesc !== "undefined" ? newLongDesc : "";

        await this.db.setMap("tasks", tasks)

    }

    public async removeColumn(boardId: string, columnId: string) {

        const boardMap = await this.db.getMap<Array<string>>("boardColMap");
        const colsInBoard = boardMap.get(boardId);

        if (! colsInBoard) {
            throw new Error(`cannot find column ${columnId} in board ${boardId}`);
        }

        const tasks = await this.getTasksByColumn(columnId);
        if (tasks.length > 0) {
            throw new NonEmptyColumnException();
        }

        const map = await this.db.getMap<Array<string>>("colTaskMap");
        map.delete(columnId);
        await this.db.setMap("colTaskMap", map);

        const updatedCols = colsInBoard.filter(colId => colId !== columnId);
        boardMap.set(boardId, updatedCols);
        await this.db.setMap("boardColMap", boardMap);

        let columns = await this.getColumns();
        columns.delete(columnId);
        await this.db.setMap("columnsMap", columns);
    }

    public async removeCurrentBoard() {
        const boardId = await this.getCurrentBoard();
        if (boardId !== null) {
            const cols = await this.getColumnsByBoard(boardId);

            const colMods = cols.map(col => {
                return async function () {
                    if (col) {
                        await this.removeColumn(boardId, col.id)
                    }
                }
            });

            await Promise.all(colMods);

            const boardsMap = await this.db.getMap<string>("boardMap");
            boardsMap.delete(boardId);
            await this.db.setMap("boardMap", boardsMap)
        }
    }

    public async clear() {
        await this.db.clear();
        await this.initData();
    }

    public async getBoardColumnsMap(): Promise<Map<string, Array<Column>>> {

        const boardsToColsMap = await this.db.getMap<Array<string>>("boardColMap");
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
        const colTaskMap = await this.db.getMap<Array<string>>("colTaskMap");
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

    private async detachTask(columnId: string, taskId: string) {

        const map = await this.db.getMap<Array<string>>("colTaskMap");

        if (! map.has(columnId)) {
            throw new Error(`column ${columnId} does not exist`);
        }

        const tasks = map.get(columnId);
        if (tasks) {
            const updatedTasks = tasks.filter(task => task !== taskId);
            map.set(columnId, updatedTasks);

            await this.db.setMap("colTaskMap", map);
        }

    }

    private async initData() {

        const boardsMap = await this.db.getMap<string>("boardMap");

        if (boardsMap.size === 0) {
            await this.db.setMap("boardMap", boardsMap)
        }

        const boardsToColsMap = await this.db.getMap<Array<string>>("boardColMap");
        const currentBoard = await this.getCurrentBoard();
        if (currentBoard !== null && !boardsToColsMap.has(currentBoard)) {
            boardsToColsMap.set(currentBoard, []);
            await this.db.setMap("boardColMap", boardsToColsMap)
        }
    }

}