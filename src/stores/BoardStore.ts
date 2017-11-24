import {Column} from "../model/Column";
import {Task} from "../model/Task";
import {Board} from "../model/Board";

export interface BoardStore {
    columnsInBoard: Array<Column> | null;
    columnTasks: Map<string, Array<Task>>;
    currentBoard: Board | null;
}

export interface FullStore extends BoardStore {
    boards: Array<Board>;
}

