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

    public getCurrentBoard(): string {
       return this.db.getItem("selectedBoard");
    }

    public setCurrentBoard(boardId: string) {
        this.db.setItem("selectedBoard", boardId);
    }

    public getBoards(): Map<string, string> {
        return this.db.getMap<string>("boardMap");
    }
    
    public getNextBoard(): string {
        const keys = [...this.getBoards().keys()];
        const next = (keys.indexOf(this.getCurrentBoard()) + 1) % keys.length;
        return keys[next];
    }

    public getColumns(): Map<string, Column> {
        return this.db.getMap<Column>("columnsMap");
    }

    public getTasks(): Map<string, Task> {
        return this.db.getMap<Task>("tasks");
    }
    
    public getTasksByColumn(columnId: string): Array<Task> {

        let tasks: Array<Task> = [];
        const allTasks = this.getTasks();
        const map = this.db.getMap<Array<string>>("colTaskMap");
        if (map.has(columnId)) {
            tasks = map
                .get(columnId)
                .map(taskId => allTasks.get(taskId));
        } else {
            throw new Error(`Column ${columnId} was not found`);
        }

        return tasks;
    }

    public getTasksByBoard(boardId: string): Array<Task> {
        const cols = this.getColumnsByBoard(boardId);
        let tasks = [];
        cols.forEach(col => {
            tasks = tasks.concat(this.getTasksByColumn(col.id));
        });
        return tasks;
    }

    public getColumnsByBoard(boardId: string): Array<Column> {

        let cols: Array<Column> = [];
        const allCols = this.getColumns();
        const boardsToColsMap = this.db.getMap<Array<string>>("boardColMap");

        if (boardsToColsMap.has(boardId)) {
            cols = boardsToColsMap
                .get(boardId)
                .map(colId => allCols.get(colId));
        } else {
            throw new Error(`Board ${boardId} could not be found`);
        }

        return cols;
    }

    public addColumn(name: string, wipLimit = 3): string {

        const newKey = generateUniqId(this.db, "col");
        const newCol: Column = {
            id: newKey,
            name: sanitizer.sanitizeColName(name),
            wipLimit: sanitizer.sanitizeWipLimit(wipLimit, 3)
        };

        const cols = this.getColumns();
        cols.set(newKey, newCol);

        this.db.setMap("columnsMap", cols);

        const colsTasksMap = this.db.getMap<Array<string>>("colTaskMap");
        colsTasksMap.set(newKey, []);
        this.db.setMap("colTaskMap", colsTasksMap);

        const boardsToColsMap = this.db.getMap<Array<string>>("boardColMap");
        const currentBoard = this.getCurrentBoard();
        let colsInBoard = boardsToColsMap.get(currentBoard);
        colsInBoard = colsInBoard.concat(newKey);
        boardsToColsMap.set(currentBoard, colsInBoard);

        this.db.setMap("boardColMap", boardsToColsMap);

        return newKey;
    }

    public addBoard(boardName: string) {
        const newKey = generateUniqId(this.db, "board");

        const boardMap = this.db.getMap<string>("boardMap");
        boardMap.set(newKey, sanitizer.sanitizeBoardName(boardName));
        this.db.setMap("boardMap", boardMap);

        const boardsToColsMap = this.db.getMap<Array<string>>("boardColMap");
        boardsToColsMap.set(newKey, []);
        this.db.setMap("boardColMap", boardsToColsMap);

        return newKey;
    }

    public editColumn(columnId: string, columnName: string, wipLimit: number) {

        const columnsMap = this.getColumns();
        const col = columnsMap.get(columnId);

        col.name = sanitizer.sanitizeColName(columnName);
        col.wipLimit = sanitizer.sanitizeWipLimit(wipLimit, 3);

        this.db.setMap("columnsMap", columnsMap)

    }

    public addTask(columnId: string, desc: string, longdesc?: string): string {

        const newKey = generateUniqId(this.db, "task");
        const newTask: Task = {
            id: newKey,
            desc: sanitizer.sanitizeTaskTitle(desc),
            longdesc
        };

        const taskMap = this.getTasks();
        taskMap.set(newKey, newTask);

        const map = this.db.getMap<string>("colTaskMap");
        let tasksInCol = map.get(columnId);
        tasksInCol = tasksInCol.concat(newKey);
        map.set(columnId, tasksInCol);

        this.db.setMap("tasks", taskMap);
        this.db.setMap("colTaskMap", map);

        return newKey;
    }

    public moveTask(taskId: string, sourceColumnId: string, targetColumnId: string) {

        const map = this.db.getMap<Array<string>>("colTaskMap");

        const existingColTasks = map.get(sourceColumnId);
        const theTask = existingColTasks.find(task => task === taskId);
        map.set(sourceColumnId, existingColTasks.filter(task => task !== taskId));

        map.set(targetColumnId, map.get(targetColumnId).concat(theTask));
        this.db.setMap("colTaskMap", map)
    }

    public deleteTask(columnId: string, taskId: string) {

        this.detachTask(columnId, taskId);

        const tasks = this.getTasks();
        tasks.delete(taskId);
        this.db.setMap("tasks", tasks);
    }

    public switchColumns(boardId: string, firstColumnId: string, secondColumnId: string) {

        const boardColMap = this.db.getMap<Array<string>>("boardColMap");
        let columns = boardColMap.get(boardId);

        const firstIdx = columns.indexOf(firstColumnId);
        const secondIdx = columns.indexOf(secondColumnId);
        columns[firstIdx] = secondColumnId;
        columns[secondIdx] = firstColumnId;

        boardColMap.set(boardId, columns);

        this.db.setMap("boardColMap", boardColMap)

    }

    public editTask(taskId: string, newDesc: string, newLongDesc?: string) {
        
        const tasks = this.getTasks();

        let task = tasks.get(taskId);
        task.desc = sanitizer.sanitizeTaskTitle(newDesc);
        task.longdesc = newLongDesc;

        this.db.setMap("tasks", tasks)

    }

    public removeColumn(boardId: string, columnId: string) {

        const tasks = this.getTasksByColumn(columnId);
        if (tasks.length > 0) {
            throw new NonEmptyColumnException();
        }

        const map = this.db.getMap<Array<string>>("colTaskMap");
        map.delete(columnId);
        this.db.setMap("colTaskMap", map);

        const boardMap = this.db.getMap<Array<string>>("boardColMap");
        const colsInBoard = boardMap.get(boardId);
        const updatedCols = colsInBoard.filter(colId => colId !== columnId);
        boardMap.set(boardId, updatedCols);
        this.db.setMap("boardColMap", boardMap);

        let columns = this.getColumns();
        columns.delete(columnId);
        this.db.setMap("columnsMap", columns)
    }

    public removeCurrentBoard() {
        const boardId = this.getCurrentBoard();
        const cols = this.getColumnsByBoard(boardId);
        cols.forEach(col => this.removeColumn(boardId, col.id));

        const boardsMap = this.db.getMap<string>("boardMap");
        boardsMap.delete(boardId);
        this.db.setMap("boardMap", boardsMap)
    }

    public clear() {
        this.db.clear();
        this.initData();
    }

    private detachTask(columnId: string, taskId: string) {

        const map = this.db.getMap<Array<string>>("colTaskMap");

        if (! map.has(columnId)) {
            throw new Error(`column ${columnId} does not exist`);
        }

        const tasks = map.get(columnId);
        const updatedTasks = tasks.filter(task => task !== taskId);
        map.set(columnId, updatedTasks);

        this.db.setMap("colTaskMap", map)

    }

    private initData() {

        const boardsMap = this.db.getMap<string>("boardMap");

        if (boardsMap.size === 0) {
            this.db.setMap("boardMap", boardsMap)
        }

        const boardsToColsMap = this.db.getMap<Array<string>>("boardColMap");
        const currentBoard = this.getCurrentBoard();
        if (!boardsToColsMap.has(currentBoard)) {
            boardsToColsMap.set(currentBoard, []);
            this.db.setMap("boardColMap", boardsToColsMap)
        }
    }

}