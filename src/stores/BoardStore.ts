import {Column} from "../model/Column";
import {Task} from "../model/Task";

export interface BoardStore {

    boards:  Map<string, string>;
    currentBoard: string | null;
    boardColumns: Map<string, Array<Column>>;
    columnTasks: Map<string, Array<Task>>;

}
