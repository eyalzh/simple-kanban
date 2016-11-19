import {Column} from "../model/Column";
import {Task} from "../model/Task";
import {Board} from "../model/Board";

export interface BoardStore {

    boards: Array<Board>;
    currentBoard: Board | null;
    columnsInBoard: Array<Column> | null;
    columnTasks: Map<string, Array<Task>>;

}
